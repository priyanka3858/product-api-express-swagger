const express = require("express");
const app = express();
const getConnection = require("./mongodb"); // Import getConnection function
app.use(express.json()); // parse application/json
const ObjectId = require("mongodb").ObjectId;
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();
const { scrypt, randomBytes, timingSafeEqual } = require("crypto");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const swaggerJsdoc = require("swagger-jsdoc");

const { promisify } = require("util");

const scryptAsync = promisify(scrypt);

const options = {
  swaggerDefinition: require("./swagger.json"),
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css",
  })
);

app.get("/welcome", auth, (req, res) => {
  res.status(200).send(req.user);
});

app.get("/product", auth, async (req, res) => {
  try {
    let client = await getConnection();
    const collection = client.db("store").collection("product");
    const data = await collection.find({ userId: req.user.id }).toArray();
    res.send({ count: data.length, data: data });
  } catch (err) {
    return err;
  }
});

app.get("/product/:_id", auth, async (req, res) => {
  if (!req.params._id) {
    return res.status(400).send("Bad Request");
  }
  try {
    let client = await getConnection();
    const collection = client.db("store").collection("product");
    const data = await collection.findOne({
      _id: new ObjectId(req.params._id),
      userId: req.user.id,
    });
    if (!data) {
      return res.status(400).send("Not Found");
    }
    res.send(data);
  } catch (err) {
    return err;
  }
});

app.post("/product", auth, async (req, res) => {
  if (!req.body?.title || !req.body?.price) {
    return res.status(400).send("Bad Request");
  }

  try {
    let client = await getConnection();
    const collection = client.db("store").collection("product");
    await collection.insertOne({
      userId: req.user.id,
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

app.put("/product", auth, async (req, res) => {
  if (!req.body._id) {
    return res.status(400).send("Bad Request");
  }

  try {
    // connection to mongoDB
    let client = await getConnection();
    const collection = client.db("store").collection("product");
    await collection.findOneAndUpdate(
      { _id: new ObjectId(req.body._id), userId: req.user.id },

      {
        $set: {
          title: req.body.title,
          price: req.body.price,
          color: req.body.color,
          size: req.body.size,
          userId: req.user.id,
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
app.delete("/product/:_id", auth, async (req, res) => {
  if (!req.params._id) {
    return res.status(400).send("Bad Request");
  }

  try {
    let client = await getConnection();
    const collection = client.db("store").collection("product");
    await collection.findOneAndDelete({
      _id: new ObjectId(req.params._id),
      userId: req.user.id,
    }),
      function (err, res) {
        if (err) throw err;
      };
    return res.send("deleted Successfully.....");
  } catch (err) {
    console.log(err);
  }
});

// Register
app.post("/register", async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { firstName, lastName, email, password } = req.body;

    // Validate user input
    if (!(email && password && firstName && lastName)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    // const oldUser = await User.findOne({ email });
    let client = await getConnection();
    const collection = client.db("store").collection("users");
    const oldUser = await collection.findOne({
      email: email,
    });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // has and salt password
    const salt = randomBytes(16).toString("hex");
    const hashedPassword = await scryptAsync(password, salt, 64);

    // Create user in our database

    const user = await collection.insertOne({
      firstName: firstName,
      lastName: lastName,
      email: email.toLowerCase(), // sanitize
      password: `${hashedPassword.toString("hex")}.${salt}`,
      createdAt: new Date(),
    });

    // Create token
    const token = jwt.sign(
      { id: user._id, firstName, lastName, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "5h",
      }
    );
    // save user token
    user.token = token;
    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// Login
app.post("/login", async (req, res) => {
  // Our login logic starts here
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("email and password required");
    }
    // Validate if user exist in our database
    let client = await getConnection();
    const collection = client.db("store").collection("users");
    const user = await collection.findOne({
      email: email,
    });

    if (!user) {
      return res.status(400).send("Invalid Credentials");
    }

    const [hashedPassword, salt] = user.password.split(".");
    // we need to pass buffer values to timingSafeEqual
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    // we hash the new sign-in password
    const suppliedPasswordBuf = await scryptAsync(password, salt, 64);
    // compare the new supplied password with the stored hashed password
    const match = timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);

    if (match) {
      // Create token
      const accessToken = jwt.sign(
        {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        process.env.TOKEN_KEY,
        {
          expiresIn: "24h",
        }
      );

      return res.status(200).json({ accessToken });
    }
    return res.status(400).send("Invalid Credentials");
  } catch (e) {
    return res.status(400).send("Invalid Credentials");
  }
});

if (process.env.NODE_ENV !== "test") {
  app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`);
  });
}

module.exports = app;
