const test = require("flug");
const findAndRead = require("find-and-read");
const calcAsciiGridPreciseBoundingBox = require("../../src/calc-ascii-grid-precise-bounding-box.js");
const parseAsciiGridMeta = require("../../src/parse-ascii-grid-meta.js");

test("calc precise bbox from buffer with centers", async ({ eq }) => {
  const buffer = findAndRead("michigan_lld.asc");
  const bbox = calcAsciiGridPreciseBoundingBox({ data: buffer });
  eq(bbox, ["-88.00041666666665", "41.61958333333335", "-84.49958333347335", "46.09041666648785"]);
});

test("calc precise bbox from meta object with centers", async ({ eq }) => {
  const buffer = findAndRead("michigan_lld.asc");
  const meta = parseAsciiGridMeta({ data: buffer });
  const bbox = calcAsciiGridPreciseBoundingBox({ meta });
  eq(bbox, ["-88.00041666666665", "41.61958333333335", "-84.49958333347335", "46.09041666648785"]);
});

test("calc precise bbox from corners", async ({ eq }) => {
  const buffer = findAndRead("Necker_20m.asc");
  const bbox = calcAsciiGridPreciseBoundingBox({ data: buffer });
  eq(bbox, ["491501", "2556440", "594634.0933", "2645315.3392"]);
});
