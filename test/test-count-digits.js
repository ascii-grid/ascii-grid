const test = require("flug");
const countDigits = require("../src/count-digits.js");

[
  ["123", 0],
  ["-999", 0],
  ["123.456", 3],
  ["123.000", 3],
  ["632.", 0],
  ["-123.002", 3]
].forEach(([n, len]) => {
  test(`counting digits of "${n}"`, ({ eq }) => {
    const count = countDigits(n);
    eq(count, len);
  });
});
