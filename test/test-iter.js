const test = require("flug");
const toab = require("toab");
const findAndRead = require("find-and-read");
const iterAsciiGridPoint = require("../src/iter-ascii-grid-point");

const buffer = findAndRead("michigan_lld.asc");

const NCOLS = 4201;
const NROWS = 5365;

const check = ({ data, eq }) => {
  const iterator = iterAsciiGridPoint({ data, debug_level: 0 });
  eq(iterator.next(), { value: { c: 0, r: 0, num: -9999 }, done: false });

  let i = 1;
  let obj;
  while (((obj = iterator.next()), obj.done === false)) {
    i++;
    eq(obj.done, false);
    eq(Object.keys(obj.value).sort(), ["c", "r", "num"].sort());
  }
  eq(obj.value, undefined);
  eq(obj.done, true);
  eq(i, NCOLS * NROWS);
};

test("iter buffer", async ({ eq }) => {
  console.log("starting: iter buffer");
  check({ data: buffer, eq });
});

test("iter array buffer", async ({ eq }) => {
  console.log("starting: iter array buffer");
  const ab = await toab(buffer);
  check({ data: ab, eq });
});
