const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI");
}

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db();

  await Promise.all([
    db.collection("news_articles").createIndex({ createdAt: -1 }),
    db.collection("news_articles").createIndex({ category: 1, lang: 1 }),
    db.collection("news_articles").createIndex({ slug: 1 }, { unique: true })
  ]);

  return { db };
}

module.exports = connectToDatabase;
