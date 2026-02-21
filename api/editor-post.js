const connectToDatabase = require("../lib/mongodb");
const crypto = require("crypto");

module.exports = async function handler(req, res) {
  try {
    const { title, description, image, category, lang } = req.body;

    const { db } = await connectToDatabase();

    const slug = crypto
      .createHash("md5")
      .update(title + Date.now())
      .digest("hex");

    await db.collection("news_articles").insertOne({
      title,
      description,
      image,
      category,
      lang,
      region: "UP/Bihar",
      sourceType: "editor",
      slug,
      createdAt: new Date(),
      views: 0
    });

    res.status(200).json({ success: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
