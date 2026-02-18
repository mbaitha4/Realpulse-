import clientPromise from "../lib/mongodb";

export default async function handler(req, res) {

res.setHeader("Cache-Control","s-maxage=300, stale-while-revalidate=600");

const { page=1, category="general", lang="en" } = req.query;
const limit = 10;

const client = await clientPromise;
const db = client.db("realpulse");

const articles = await db.collection("articles")
.find({ category, lang })
.sort({ publishedAt: -1 })
.skip((page-1)*limit)
.limit(limit)
.toArray();

res.status(200).json({ articles });

}
