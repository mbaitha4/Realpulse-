const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  try {
    const { db } = await connectToDatabase();

    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`
    );

    const data = await response.json();

    if (data.articles && data.articles.length > 0) {
      await db.collection("news").deleteMany({});
      await db.collection("news").insertMany(
        data.articles.map(a => ({
          ...a,
          createdAt: new Date()
        }))
      );

      return res.status(200).json({ message: "Seeded successfully" });
    }

    return res.status(200).json({ message: "No live news" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
