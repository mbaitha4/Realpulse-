const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to environment variables");
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db();

  // Safe index creation
  await Promise.all([
    db.collection("live_news").createIndex({ createdAt: -1 }),
    db.collection("editor_news").createIndex({ createdAt: -1 }),
    db.collection("live_news").createIndex({ category: 1, lang: 1 }),
    db.collection("editor_news").createIndex({ category: 1, lang: 1 }),
    db.collection("settings").createIndex({ key: 1 })
  ]);

  return { client, db };
}

module.exports = connectToDatabase;
