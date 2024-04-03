const { randomBytes } = require("crypto");
const { scryptAsync, timingSafeEqual } = require("crypto").webcrypto;

const Password = {
  async hashPassword(password) {
    const salt = randomBytes(16).toString("hex");
    const buf = await scryptAsync(password, salt, 64);
    return `${buf.toString("hex")}.${salt}`;
  },

  async comparePassword(storedPassword, suppliedPassword) {
    // split() returns array
    const [hashedPassword, salt] = storedPassword.split(".");
    // we need to pass buffer values to timingSafeEqual
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    // we hash the new sign-in password
    const suppliedPasswordBuf = await scryptAsync(suppliedPassword, salt, 64);
    // compare the new supplied password with the stored hashed password
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

module.exports = Password;
