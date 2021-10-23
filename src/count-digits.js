/**
 * @name countDigits
 * @description count the number of digits right of the decimal point for a given numerical string
 * @param {String} n - a number as a string
 * @returns {Number} the number of digits right of the decimal point
 */
module.exports = function countDigits(n) {
  return (n.split(".")[1] || "").length;
};
