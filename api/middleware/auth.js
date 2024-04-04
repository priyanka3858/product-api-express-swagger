const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  let token = req.get("authorization");

  console.log("token", token);
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
