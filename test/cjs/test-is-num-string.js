const test = require("flug");
const isNumString = require("../../src/is-num-string.js");

test("isNumString", async ({ eq }) => {
  eq(isNumString(1), false);
  eq(isNumString("1"), true);
  eq(isNumString("-1"), true);
  eq(isNumString("51.9985704523422"), true);
});
