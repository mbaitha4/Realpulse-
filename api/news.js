const connectToDatabase = require("../lib/mongodb");
const https = require("https");

function fetchFromGNews(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      let data = "";

      resp.on("data", (chunk) => {
        data += chunk;
      });

      resp.on("end", () => {
        resolve(JSON.parse(data));
      });

    }).on("error", (err) => {
      reject(err);
    });
  });
}

module.exports = async function handler(req, res) {
  try {
    const { category = "general", lang = "en" } = req.query;

    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=${lang}&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`;

    const gnewsData = await fetchFromGNews(url);

    const { db } = await connectToDatabase();

    if (gnewsData.articles && gnewsData.articles.length > 0) {

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

    const cached = await db.collection("news")
      .find({ category, lang })
      .sort({ createdAt: -1 })
      .limit(10)
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
