const connectToDatabase = require("../lib/mongodb");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    const categories = ["general", "business", "sports", "technology", "nation"];
    const lang = "en";

    for (const category of categories) {

      const response = await fetch(
        `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`
      );

      const data = await response.json();

      if (!data.articles?.length) continue;

      const bulkOps = data.articles.map(article => {
        const slug = crypto
          .createHash("md5")
          .update(article.title)
          .digest("hex");

        return {
          updateOne: {
            filter: { slug },
            update: {
              $setOnInsert: {
                ...article,
                slug,
                category,
                lang,
                region: "India",
                sourceType: "gnews",
                createdAt: new Date(),
                views: 0
              }
            },
            upsert: true
          }
        };
      });

      await db.collection("live_news").bulkWrite(bulkOps);

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.status(200).json({ success: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
