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
    /* FETCH LIVE ONLY FOR PAGE 1   */
    /* ============================= */

    if (page === 1) {
      try {
        const response = await fetch(
          `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`
        );

        const data = await response.json();

        if (data.articles?.length) {
          const bulkOps = data.articles.map(article => ({
            updateOne: {
              filter: { title: article.title, category, lang },
              update: {
                $setOnInsert: {
                  ...article,
                  category,
                  lang,
                  createdAt: new Date()
                }
              },
              upsert: true
            }
          }));

          await db.collection("live_news").bulkWrite(bulkOps);
        }

      } catch (err) {
        console.log("GNews API failed:", err.message);
      }
    }

    /* ============================= */
    /* PAGINATE FROM DATABASE ONLY  */
    /* ============================= */

    const articles = await db.collection("live_news")
      .find({ category, lang })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json({ articles });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
