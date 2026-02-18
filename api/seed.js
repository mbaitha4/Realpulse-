const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    const sampleNews = [
      {
        title: "RealPulse Sample News 1",
        description: "This is a manually inserted news article for testing fallback system.",
        image: "https://picsum.photos/600/300",
        category: "general",
        lang: "en",
        createdAt: new Date(),
        url: "#"
      },
      {
        title: "RealPulse Sample News 2",
        description: "Second test article to verify MongoDB fallback functionality.",
        image: "https://picsum.photos/600/301",
        category: "general",
        lang: "en",
        createdAt: new Date(),
        url: "#"
      }
    ];

    await db.collection("news").insertMany(sampleNews);

    res.status(200).json({ message: "Sample data inserted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
