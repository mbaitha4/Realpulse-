const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const { page = 1, category = "general", lang = "en" } = req.query;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const { db } = await connectToDatabase();

    let liveArticles = null;

    try {
      const response = await fetch(
        `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`
      );

      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        // Save only if first page
        if (page == 1) {
          await db.collection("news").deleteMany({ category, lang });
          await db.collection("news").insertMany(
            data.articles.map(a => ({
              ...a,
              category,
              lang,
              createdAt: new Date()
            }))
          );
        }

        return res.status(200).json({
          articles: data.articles,
          source: "live"
        });
      }

    } catch (err) {
      console.log("Live API failed:", err.message);
    }

    // 🔥 FALLBACK TO CACHE
    const cached = await db.collection("news")
      .find({ category, lang })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return res.status(200).json({
      articles: cached,
      source: "cache"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};
