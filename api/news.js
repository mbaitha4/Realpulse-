const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const { category = "general", lang = "en" } = req.query;
    const { db } = await connectToDatabase();

    let gnewsData = null;

    try {
      const response = await fetch(
        `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`
      );

      gnewsData = await response.json();

      if (gnewsData.articles && gnewsData.articles.length > 0) {
        // Save fresh news in Mongo
        await db.collection("news").insertMany(
          gnewsData.articles.map(a => ({
            ...a,
            category,
            lang,
            createdAt: new Date()
          }))
        );

        return res.status(200).json({
          articles: gnewsData.articles,
          source: "live"
        });
      }

    } catch (err) {
      console.log("GNews failed, using cache");
    }

    // 🔥 Fallback to cached news
    const cachedNews = await db.collection("news")
      .find({ category, lang })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return res.status(200).json({
      articles: cachedNews,
      source: "cache"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};
