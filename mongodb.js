const { MongoClient } = require("mongodb");

const dbUrl =
  "mongodb+srv://ecommerce:yQorDDcUREZaXdBy@node-task-manager.a0yvigo.mongodb.net/?retryWrites=true&w=majority&appName=Node-task-manager";

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
