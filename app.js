const express = require("express");
const app = express();
const port = 3000;
const { MongoClient, ObjectID } = require("mongodb");
const bodyParser = require("body-parser");
app.use(express.json()); // parse application/json
const ObjectId = require("mongodb").ObjectId;

// set url for mongoDB
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

app.get("/product", async (req, res) => {
  try {
    let client = await getConnection();
    const collection = client.db("03-TASK-MANAGER").collection("product");
    const data = await collection.find({}).toArray();
    res.send({ count: data.length, data: data });
  } catch (err) {
    console.log(err);
    console.log("no data");
  }
});

app.get("/product/:_id", async (req, res) => {
  if (!req.params._id) {
    return res.status(400).send("Bad Request");
  }
  try {
    let client = await getConnection();
    const collection = client.db("03-TASK-MANAGER").collection("product");
    const data = await collection.findOne({
      _id: new ObjectId(req.params._id),
    });
    res.send(data);
  } catch (err) {
    console.log(err);
    console.log("no product found");
  }
});

app.post("/product", async (req, res) => {
  if (!req.body?.title || !req.body?.price) {
    return res.status(400).send("Bad Request");
  }

  try {
    let client = await getConnection();
    const collection = client.db("03-TASK-MANAGER").collection("product");
    await collection.insertOne({
      title: req.body?.title,
      price: req.body?.price,
      color: req.body?.color,
      size: req.body?.size,
      description: req.body.description,
      createdAt: new Date(),
    }),
      function (err, res) {
        if (err) throw err;
      };
    return res.send("inserted Successfully.....");
  } catch (err) {
    console.log(err);
  }
});

app.put("/product", async (req, res) => {
  if (!req.body._id) {
    return res.status(400).send("Bad Request");
  }

  try {
    // connection to mongoDB
    let client = await getConnection();
    const collection = client.db("03-TASK-MANAGER").collection("product");
    await collection.updateOne(
      { _id: new ObjectId(req.body._id) },

      {
        $set: {
          title: req.body.title,
          price: req.body.price,
          color: req.body.color,
          size: req.body.size,
          description: req.body.description,
        },
      }
    ),
      function (err, res) {
        if (err) throw err;
      };
    return res.send("updated Successfully.....");
  } catch (err) {
    console.log(err);
  }
});

// DELETE request handler
app.delete("/product/:_id", async (req, res) => {
  if (!req.params._id) {
    return res.status(400).send("Bad Request");
  }

  try {
    let client = await getConnection();
    const collection = client.db("03-TASK-MANAGER").collection("product");
    await collection.deleteOne({ _id: new ObjectId(req.params._id) }),
      function (err, res) {
        if (err) throw err;
      };
    return res.send("deleted Successfully.....");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
