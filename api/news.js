const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category || "general";
    const lang = req.query.lang || "en";

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const { db } = await connectToDatabase();

    /* ============================= */
    /* AUTO CLEAN 15 DAYS            */
    /* ============================= */

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    await db.collection("live_news").deleteMany({
      createdAt: { $lt: fifteenDaysAgo }
    });

    /* ============================= */
    /* FETCH LIVE ONLY IF EMPTY      */
    /* ============================= */

    const existingCount = await db.collection("live_news")
      .countDocuments({ category, lang });

    if (existingCount === 0 && page === 1) {
      try {
        const response = await fetch(
          `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`
        );

        const data = await response.json();

        if (data.articles?.length) {
          const bulk = data.articles.map(article => ({
            ...article,
            category,
            lang,
            createdAt: new Date()
          }));

          await db.collection("live_news").insertMany(bulk);
        }
      } catch (err) {
        console.log("GNews API error:", err.message);
      }
    }

    /* ============================= */
    /* MERGE USING AGGREGATION       */
    /* ============================= */

    const articles = await db.collection("live_news")
      .aggregate([
        { $match: { category, lang } },
        {
          $unionWith: {
            coll: "editor_news",
            pipeline: [
              { $match: { category, lang } }
            ]
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: pageSize }
      ])
      .toArray();

    return res.status(200).json({ articles });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
