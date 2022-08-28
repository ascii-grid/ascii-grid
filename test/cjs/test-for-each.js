const test = require("flug");
const findAndRead = require("find-and-read");
const forEachAsciiGridPoint = require("../../src/for-each-ascii-grid-point");

test("for each", async ({ eq }) => {
  console.time("for each");
  const buffer = findAndRead("michigan_lld.asc");

  const start_row = 1000;
  const start_column = 1234;
  const end_column = 2345;
  const end_row = 2000;
  const setOfValues = new Set();
  forEachAsciiGridPoint({
    data: buffer,
    debug_level: 0,
    start_column,
    end_column,
    start_row,
    end_row,
    callback: ({ num }) => {
      setOfValues.add(num);
    }
  });

  eq(setOfValues.size, 416299);
  console.timeEnd("for each");
});
