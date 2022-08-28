function isNumString(str) {
  return typeof str === "string" && !!str.match(/^[\d\.\-\+e]+$/);
}

module.exports = isNumString;
module.exports.default = isNumString;
