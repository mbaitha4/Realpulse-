import clientPromise from "../lib/mongodb.js";

export default async function handler(req, res) {
  try {

    if (!process.env.MONGODB_URI) {
      return res.status(500).json({ error: "MONGODB_URI missing" });
    }

    const client = await clientPromise;
    const db = client.db("realpulse");

    const articles = await db.collection("articles")
      .find({})
      .limit(5)
      .toArray();

    return res.status(200).json({ articles });

  } catch (error) {
    return res.status(500).json({
      message: "Server crashed",
      error: error.message
    });
  }
}
