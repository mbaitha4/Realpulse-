const connectToDatabase = require("../lib/mongodb");

module.exports = async function handler(req, res) {
  res.status(200).json({ message: "fetch working" });
};
