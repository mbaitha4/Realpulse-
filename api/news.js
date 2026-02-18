const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    const articles = await db
      .collection("articles")
      .find({})
      .limit(5)
      .toArray();

    res.status(200).json({ success: true, count: articles.length });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
