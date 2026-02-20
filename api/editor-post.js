const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const { title, description, image, category, lang } = req.body;

    const { db } = await connectToDatabase();

    await db.collection("editor_news").insertOne({
      title,
      description,
      image,
      category,
      lang,
      createdAt: new Date(),
      source: "editor"
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
