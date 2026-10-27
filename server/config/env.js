
require("dotenv").config();

const requiredVariables = ["PORT", "MONGODB_URI"];

function validateEnv() {
  const missing = requiredVariables.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

module.exports = { validateEnv };
