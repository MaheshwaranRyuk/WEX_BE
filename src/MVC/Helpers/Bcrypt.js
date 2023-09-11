const bcrypt = require("bcryptjs");

// Number of salt rounds for bcrypt
const saltRounds = 10;

// Hash a text using bcrypt
async function hashText(text) {
  try {
    const hashedText = await bcrypt.hash(text, saltRounds);
    return hashedText;
  } catch (error) {
    console.log(error);
  }
}

// Verify a text against a hashed text
async function verifyText(text, hashedText) {
  try {
    const isMatch = await bcrypt.compare(text, hashedText);
    return isMatch;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  hashText,
  verifyText,
};
