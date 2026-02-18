const clientPromise = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("realpulse");

    const articles = await db.collection("articles")
      .find({})
      .limit(5)
      .toArray();

    res.status(200).json({ success: true, count: articles.length });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
