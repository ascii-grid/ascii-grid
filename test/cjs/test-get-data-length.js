const test = require("flug");
const findAndRead = require("find-and-read");
const toab = require("toab");
const getDataLength = require("../../src/get-data-length");

const buf = findAndRead("Necker_20m.asc");

test("get data length of string", async ({ eq }) => {
  const len = getDataLength({ data: findAndRead("keypad.asc", { encoding: "utf-8" }) });
  eq(len, 103);
});

test("get data length of buffer", async ({ eq }) => {
  const len = getDataLength({ data: buf });
  eq(len, 150678989);
});

test("get data length of array buffer", async ({ eq }) => {
  const ab = await toab(buf);
  const len = getDataLength({ data: ab });
  eq(len, 150678989);
});
