const express = require("express");
const app = express();
const port = 3000;

// GET all
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// GET single
app.get("/:id", (req, res) => {
  res.send("Hello World!");
});

// POST request handler
app.post("/", (req, res) => {
  res.send("Hello World from POST!");
});

// PUT request handler
app.put("/:id", (req, res) => {
  res.send("Hello World from PUT!");
});

// DELETE request handler
app.delete("/:id", (req, res) => {
  res.send("Hello World from DELETE!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
