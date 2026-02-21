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
    /* AUTO CLEAN (15 DAYS)         */
    /* ============================= */

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    await db.collection("live_news").deleteMany({
      createdAt: { $lt: fifteenDaysAgo }
    });

    /* ============================= */
    /* CHECK LAST FETCH PER CATEGORY */
    /* ============================= */

    const settingKey = `gnews_${category}_${lang}`;
    const settings = await db.collection("settings").findOne({ key: settingKey });

    const now = new Date();
    const shouldFetch =
      !settings ||
      !settings.lastFetchedAt ||
      (now - new Date(settings.lastFetchedAt)) > (30 * 60 * 1000);

    if (shouldFetch) {
      try {
        const response = await fetch(
          `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`
        );

        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
          for (const article of data.articles) {
            const exists = await db.collection("live_news").findOne({
              title: article.title,
              category,
              lang
            });

            if (!exists) {
              await db.collection("live_news").insertOne({
                ...article,
                category,
                lang,
                createdAt: new Date()
              });
            }
          }

          await db.collection("settings").updateOne(
            { key: settingKey },
            { $set: { lastFetchedAt: new Date() } },
            { upsert: true }
          );
        }

      } catch (err) {
        console.log("GNews API error:", err.message);
      }
    }

    /* ============================= */
    /* LOAD PAGINATED LIVE NEWS      */
    /* ============================= */

    const liveNews = await db.collection("live_news")
      .find({ category, lang })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const editorNews = await db.collection("editor_news")
      .find({ category, lang })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    // Merge current page only
    const articles = [...editorNews, ...liveNews]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      articles
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
