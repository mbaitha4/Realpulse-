const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect().then((client) => {
      return {
        client,
        db: client.db("realpulse"),
      };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectToDatabase;
