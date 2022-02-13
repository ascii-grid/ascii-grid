const test = require("flug");
const findAndRead = require("find-and-read");
const calcAsciiGridBoundingBox = require("../src/calc-ascii-grid-bounding-box.js");
const parseAsciiGridMeta = require("../src/parse-ascii-grid-meta.js");

test("calc bbox from buffer with centers", async ({ eq }) => {
  const buffer = findAndRead("michigan_lld.asc");
  const bbox = calcAsciiGridBoundingBox({ data: buffer });
  eq(bbox, [-88.00041666666665, 41.619583333333345, -84.49958333347335, 46.09041666648785]);
});

test("calc bbox from meta object with centers", async ({ eq }) => {
  const buffer = findAndRead("michigan_lld.asc");
  const meta = parseAsciiGridMeta({ data: buffer });
  const bbox = calcAsciiGridBoundingBox({ meta });
  eq(bbox, [-88.00041666666665, 41.619583333333345, -84.49958333347335, 46.09041666648785]);
});

test("calc bbox from corners", async ({ eq }) => {
  const buffer = findAndRead("Necker_20m.asc");
  const bbox = calcAsciiGridBoundingBox({ data: buffer });
  eq(bbox, [491501, 2556440, 594634.0933000001, 2645315.3392]);
});
