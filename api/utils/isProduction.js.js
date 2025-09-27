// utils/isProduction.js
function isProduction() {
  return process.env.NODE_STAGE === "production";
}

module.exports = isProduction;
