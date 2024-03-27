const express = require("express");
const app = express();
const port = 3000;
const { ObjectID } = require("mongodb");
const getConnection = require("./mongodb"); // Import getConnection function
app.use(express.json()); // parse application/json
const ObjectId = require("mongodb").ObjectId;
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/product", async (req, res) => {
  try {
    let client = await getConnection();
    const collection = client.db("store").collection("product");
    const data = await collection.find({}).toArray();
    res.send({ count: data.length, data: data });
  } catch (err) {
    return err;
  }
});

app.get("/product/:_id", async (req, res) => {
  if (!req.params._id) {
    return res.status(400).send("Bad Request");
  }
  try {
    let client = await getConnection();
    const collection = client.db("store").collection("product");
    const data = await collection.findOne({
      _id: new ObjectId(req.params._id),
    });
    if (!data) {
      return res.status(400).send("Not Found");
    }
    res.send(data);
  } catch (err) {
    return err;
  }
});

app.post("/product", async (req, res) => {
  if (!req.body?.title || !req.body?.price) {
    return res.status(400).send("Bad Request");
  }

  try {
    let client = await getConnection();
    const collection = client.db("store").collection("product");
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
    const collection = client.db("store").collection("product");
    await collection.findOneAndUpdate(
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
    res.status(500).send(err.message);
  }
});

// DELETE request handler
app.delete("/product/:_id", async (req, res) => {
  if (!req.params._id) {
    return res.status(400).send("Bad Request");
  }

  try {
    let client = await getConnection();
    const collection = client.db("store").collection("product");
    await collection.findOneAndDelete({ _id: new ObjectId(req.params._id) }),
      function (err, res) {
        if (err) throw err;
      };
    return res.send("deleted Successfully.....");
  } catch (err) {
    console.log(err);
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

module.exports = app;
