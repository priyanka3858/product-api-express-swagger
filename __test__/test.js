const request = require("supertest");
const app = require("../app"); // assuming your Express app is defined in a file named app.js

describe("GET /product", () => {
  it("responds with json containing a list of all products", async () => {
    const response = await request(app).get("/product");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("count");
    expect(response.body).toHaveProperty("data");
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe("GET /product/:_id", () => {
  it("responds with json containing the details of a product", async () => {
    // You need to replace productId with an actual product ID from your database
    const productId = "660357c69421c97185dad3fe";
    const response = await request(app).get(`/product/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id", productId);
    // Add more expectations based on the expected structure of your product object
  });

  it("responds with 400 Bad Request if _id is not provided", async () => {
    const productId = "660357c69421c97185dad3f3";

    const response = await request(app).get(`/product/${productId}`);
    expect(response.status).toBe(400);
  });
});

// // Write similar test cases for POST, PUT, and DELETE endpoints

describe("POST /product", () => {
  it("adds a new product to the database and returns 200 OK", async () => {
    const newProduct = {
      title: "New Product From the test",
      price: 19.99,
      color: "Green",
      size: "XL",
      description: "A new product for testing purposes",
    };

    const response = await request(app)
      .post("/product")
      .send(newProduct)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.text).toBe("inserted Successfully.....");

    // Verify that the product is added to the database
  });

  it("returns 400 Bad Request if title or price is missing", async () => {
    // Omitting title and price fields to trigger a validation error
    const invalidProduct = {
      color: "Blue",
      size: "M",
      description: "An invalid product",
    };

    const response = await request(app)
      .post("/product")
      .send(invalidProduct)
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
  });

  // Add more test cases as needed for other scenarios
});

// describe("PUT /product", () => {
//   // Write your test cases for the PUT endpoint here
// });

// describe("DELETE /product/:_id", () => {
//   // Write your test cases for the DELETE endpoint here
// });
