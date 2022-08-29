const isNumString = require("./is-num-string");

function isNumLike(it) {
  return typeof it === "number" || isNumString(it);
}

module.exports = isNumLike;
module.exports.default = isNumLike;
