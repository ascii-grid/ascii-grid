const { readFileSync } = require("fs");
const test = require("ava");
const toab = require("toab");
const fastMin = require("fast-min");
const fastMax = require("fast-max");

const isAsciiGrid = require("./src/is-ascii-grid");
const parseAsciiGridMetaData = require("./src/parse-ascii-grid-meta");
const parseAsciiGridData = require("./src/parse-ascii-grid-data");

test("identifying ascii grid file extensions", async t => {
  t.true(await isAsciiGrid({ data: "michigan_lld.asc" }));
  t.true(await isAsciiGrid({ data: "michigan_lld.asc.tar" }));
  t.true(await isAsciiGrid({ data: "michigan_lld.asc.tar.gz" }));
  t.true(await isAsciiGrid({ data: "michigan_lld.asc.zip" }));
  t.false(await isAsciiGrid({ data: "michigan_lld.asc.json" }));
});

test("identifying ascii grid file from buffers", async t => {
  const buffer = readFileSync("./test_data/michigan_lld/michigan_lld.asc");
  const bufferIsAsciiGrid = await isAsciiGrid({ data: buffer, debug: false });
  t.true(bufferIsAsciiGrid);
  t.true(await isAsciiGrid({ data: Uint8Array.from(buffer) }));
  t.true(await isAsciiGrid({ data: await toab(buffer) }));
});

test("reading ascii metadata", async t => {
  const buffer = readFileSync("./test_data/michigan_lld/michigan_lld.asc");
  const meta = await parseAsciiGridMetaData({ data: buffer, debug: false });

  // check metadata
  t.is(meta.ncols, 4201);
  t.is(meta.nrows, 5365);
  t.is(meta.xllcenter, -88);
  t.is(meta.yllcenter, 41.62);
  t.is(meta.cellsize, 0.0008333333333);
  t.is(meta.nodata_value, -9999);
  t.is(meta.last_metadata_line, 5);
  t.is(meta.last_metadata_byte, 95);
});

test("reading ascii values", async t => {
  const buffer = readFileSync("./test_data/michigan_lld/michigan_lld.asc");
  const result = await parseAsciiGridData({ data: buffer, debug: true });

  const lastRow = result.values[result.values.length - 1];
  t.is(fastMin(lastRow, { debug: false }), -0.102997);
  t.is(fastMax(lastRow, { debug: false }), 165.940948);
  t.is(result.values.length, 5365);
  t.deepEqual(Array.from(new Set(result.values[0])).sort(), [-9999, 9999]);
  t.true(result.values.every(ln => ln.length === 4201));
  t.deepEqual(new Set(result.values[result.values.length - 1]).size, 3615);
});
