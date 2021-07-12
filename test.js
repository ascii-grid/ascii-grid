const { readFileSync } = require("fs");
const test = require("flug");
const toab = require("toab");
const fastMin = require("fast-min");
const fastMax = require("fast-max");

const isAsciiGrid = require("./src/is-ascii-grid");
const parseAsciiGridMetaData = require("./src/parse-ascii-grid-meta");
const parseAsciiGridData = require("./src/parse-ascii-grid-data");

const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

const cache = {};
const getDataLinesAnotherWay = filepath => {
  if (!(filepath in cache)) {
    const lines = readFileSync(filepath, "utf-8").trimEnd().split("\n");
    const ncols = Number(lines.find(ln => ln.startsWith("ncols")).split(" ")[1]);
    const nums = lines
      .filter(ln => !ln.match(/^[a-z]/))
      .join("\n")
      .split(/[\n ]+/g)
      .map(str => Number(str));
    const data = chunk(nums, ncols);
    cache[filepath] = data;
  }
  return cache[filepath];
};

const HAWAII_FILEPATH = "./test_data/Necker_20m.asc/Necker_20m.asc";
const HAWAII_DATA = getDataLinesAnotherWay(HAWAII_FILEPATH);

if (new Set(HAWAII_DATA.map(row => row.length).slice(0, -1)).size !== 1) {
  throw new Error("Hawaii Data has inconsistent row lengths");
}

const MICHIGAN_FILEPATH = "./test_data/michigan_lld/michigan_lld.asc";
const MICHIGAN_DATA = getDataLinesAnotherWay(MICHIGAN_FILEPATH);

test("identifying ascii grid file extensions", async ({ eq }) => {
  eq(await isAsciiGrid({ data: "michigan_lld.asc" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.tar" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.tar.gz" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.zip" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.json" }), false);
});

test("identifying ascii grid file from buffers", async ({ eq }) => {
  const buffer = readFileSync("./test_data/michigan_lld/michigan_lld.asc");
  const bufferIsAsciiGrid = await isAsciiGrid({ data: buffer, debug_level: 0 });
  eq(bufferIsAsciiGrid, true);
  eq(await isAsciiGrid({ data: Uint8Array.from(buffer) }), true);
  eq(await isAsciiGrid({ data: await toab(buffer) }), true);
});

test("reading ascii metadata", async ({ eq }) => {
  const buffer = readFileSync("./test_data/michigan_lld/michigan_lld.asc");
  const meta = parseAsciiGridMetaData({ data: buffer, debug_level: 0 });

  // check metadata
  eq(meta.ncols, 4201);
  eq(meta.nrows, 5365);
  eq(meta.xllcenter, -88);
  eq(meta.yllcenter, 41.62);
  eq(meta.cellsize, 0.0008333333333);
  eq(meta.nodata_value, -9999);
  eq(meta.last_metadata_line, 5);
  eq(meta.last_metadata_byte, 95);
});

test("reading new-line separated cells", ({ eq }) => {
  const buffer = readFileSync(HAWAII_FILEPATH);
  const meta = parseAsciiGridMetaData({ data: buffer, debug_level: 0 });
  eq(meta, {
    ncols: 5143,
    nrows: 4432,
    xllcorner: 491501,
    yllcorner: 2556440,
    cellsize: 20.0531,
    nodata_value: 99999,
    last_metadata_line: 5,
    last_metadata_byte: 92
  });

  const result = parseAsciiGridData({ data: buffer, debug_level: 0 });

  eq(result.values.length, meta.nrows);
  eq(result.values[0].length, meta.ncols);
  eq(new Set(result.values.map(row => row.length)).size, 1);
  eq(
    result.values.map(row => row.length),
    HAWAII_DATA.map(row => row.length)
  );
  eq(result.values, HAWAII_DATA);
});

test("reading ascii values", async ({ eq }) => {
  console.time("reading ascii values");
  const buffer = readFileSync(MICHIGAN_FILEPATH);
  const result = parseAsciiGridData({ data: buffer, debug_level: 0 });

  const lastRow = result.values[result.values.length - 1];

  eq(result.values.length, 5365);

  // check set of values from the first line

  eq(Array.from(new Set(result.values[0])), [-9999]);
  eq(result.values, MICHIGAN_DATA);
  eq(
    result.values.every(ln => ln.length === 4201),
    true
  );
  eq(fastMin(lastRow, { debug_level: 0 }), -0.102997);
  eq(fastMax(lastRow, { debug_level: 0 }), 165.940948);
  eq(new Set(result.values[result.values.length - 1]).size, 3615);
  console.timeEnd("reading ascii values");
});

test("start_row", async ({ eq }) => {
  console.time("reading box of ascii values");
  const buffer = readFileSync(MICHIGAN_FILEPATH);

  const start_row = 2000;
  const result = parseAsciiGridData({
    data: buffer,
    debug_level: 0,
    start_row
  });

  eq(result.values.length, 5365 - start_row);
  eq(
    result.values.every(ln => ln.length === 4201),
    true
  );

  // check first row
  eq(result.values[0], MICHIGAN_DATA[start_row]);

  const lastRow = result.values[result.values.length - 1];
  const trueLastRow = MICHIGAN_DATA[MICHIGAN_DATA.length - 1];

  eq(fastMin(lastRow), fastMin(trueLastRow));
  eq(fastMax(lastRow), fastMax(trueLastRow));

  eq(new Set(result.values[result.values.length - 1]).size, 3615);
  console.timeEnd("reading box of ascii values");
});

test("end_row", async ({ eq }) => {
  console.time("reading box of ascii values");
  const filepath = "./test_data/michigan_lld/michigan_lld.asc";
  const buffer = readFileSync(filepath);

  const end_row = 2000;
  const result = parseAsciiGridData({
    data: buffer,
    debug_level: 0,
    end_row
  });

  const trueEndRow = MICHIGAN_DATA[end_row];
  const endRow = result.values[result.values.length - 1];
  eq(endRow, trueEndRow);
  eq(result.values, MICHIGAN_DATA.slice(0, end_row + 1));
  eq(result.values.length, end_row + 1);
  eq(
    result.values.every(ln => ln.length === 4201),
    true
  );
  console.timeEnd("reading box of ascii values");
});

test("keypad", async ({ eq }) => {
  const buffer = readFileSync("./test_data/keypad.asc");
  const meta = parseAsciiGridMetaData({ data: buffer, debug_level: 0 });
  eq(meta, {
    ncols: 3,
    nrows: 3,
    xllcenter: -88,
    yllcenter: 41.62,
    cellsize: 0.0008333333333,
    nodata_value: 0,
    last_metadata_line: 5,
    last_metadata_byte: 85
  });

  const result = parseAsciiGridData({
    data: buffer,
    debug_level: 0,
    start_column: 0,
    end_column: 2,
    start_row: 0,
    end_row: 2
  });
  eq(result, {
    values: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]
  });

  // clipping
  const result2 = parseAsciiGridData({
    data: buffer,
    debug_level: 0,
    start_column: 1,
    end_column: 1,
    start_row: 1,
    end_row: 1
  });
  eq(result2, {
    values: [[5]]
  });

  // top left box
  const result3 = parseAsciiGridData({
    data: buffer,
    debug_level: 0,
    start_column: 0,
    end_column: 1,
    start_row: 0,
    end_row: 1
  });
  eq(result3, {
    values: [
      [1, 2],
      [4, 5]
    ]
  });
});

test("bbox", async ({ eq }) => {
  console.time("reading box of ascii values");
  const filepath = "./test_data/michigan_lld/michigan_lld.asc";
  const buffer = readFileSync(filepath);

  const ncols = 4201;
  const start_row = 1000;
  const start_column = 1234;
  const end_column = 2345;
  const end_row = 2000;
  const result = parseAsciiGridData({
    data: buffer,
    debug_level: 0,
    start_column,
    end_column,
    start_row,
    end_row
  });
  const datalines = MICHIGAN_DATA.slice(start_row, end_row + 1).map(row => row.slice(start_column, end_column + 1));
  eq(result.values, datalines);
  eq(new Set(result.values.flat()).size, new Set(datalines.flat()).size);
  console.timeEnd("reading box of ascii values");
});

test("flat", async ({ eq }) => {
  console.time("reading flat");
  const buffer = readFileSync(MICHIGAN_FILEPATH);

  const start_row = 100;
  const end_row = 200;
  const start_column = 100;
  const end_column = 200;

  const result = parseAsciiGridData({
    data: buffer,
    start_row,
    end_row,
    start_column,
    end_column,
    flat: true
  });

  const height = end_row - start_row + 1;
  const width = end_column - start_column + 1;

  eq(result.values.length, width * height);
  eq(new Set(result.values.slice(-1 * width)).size, 94);
  console.timeEnd("reading flat");
});
