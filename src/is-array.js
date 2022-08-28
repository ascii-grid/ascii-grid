function isArray(arr) {
  if (Array.isArray(arr)) return true;
  if (typeof arr === "object" && typeof arr.constructor === "function" && arr.constructor.name.indexOf("Array") > 0) return true;
  return false;
}

module.exports = isArray;
module.exports.default = isArray;
