const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    const oldData = await db.collection("live_news").find({}).toArray();

    if (!oldData.length) {
      return res.status(200).json({ message: "No data to migrate" });
    }

    const bulkOps = oldData.map(article => ({
      updateOne: {
        filter: { title: article.title },
        update: {
          $setOnInsert: {
            ...article,
            sourceType: "gnews"
          }
        },
        upsert: true
      }
    }));

    await db.collection("news_articles").bulkWrite(bulkOps);

    res.status(200).json({
      message: "Migration complete",
      migrated: oldData.length
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
