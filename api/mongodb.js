const { MongoClient } = require("mongodb");

const dbUrl = process.env.MOGNO_URI;

let client = null;

const getConnection = async () => {
  if (client == null) {
    client = new MongoClient(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    console.log("Connected to MongoDB Atlas");
  }
  return client;
};

module.exports = getConnection;
