const { MongoClient } = require("mongodb");

let client = null;

const getConnection = async () => {
  if (client == null) {
    client = new MongoClient(process.env.MOGNO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    console.log("Connected to MongoDB Atlas");
  }
  return client;
};

module.exports = getConnection;
