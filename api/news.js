const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category || "general";
    const lang = req.query.lang || "en";

    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const { db } = await connectToDatabase();

    const articles = await db.collection("news_articles")
      .find({ category, lang })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    res.status(200).json({ articles });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
