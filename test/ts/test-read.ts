import test from "flug";
import findAndRead from "find-and-read";
import fastMin from "fast-min";
import fastMax from "fast-max";

import { parseAsciiGridMeta, parseAsciiGridData } from "../../";

const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));

const cache = {};
const getDataLinesAnotherWay = filepath => {
  if (!(filepath in cache)) {
    const lines = findAndRead(filepath, { encoding: "utf-8" }).trimEnd().split("\n");
    const ncols = Number(lines.find(ln => ln.startsWith("ncols"))!.split(" ")[1]);
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

const HAWAII_DATA = getDataLinesAnotherWay("Necker_20m.asc");

if (new Set(HAWAII_DATA.map(row => row.length).slice(0, -1)).size !== 1) {
  throw new Error("Hawaii Data has inconsistent row lengths");
}

const MICHIGAN_DATA = getDataLinesAnotherWay("michigan_lld.asc");

test("reading new-line separated cells", ({ eq }) => {
  const buffer = findAndRead("Necker_20m.asc");
  const meta = parseAsciiGridMeta({ data: buffer, debug_level: 0 });
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

  eq(result.values[result.values.length - 2], result.values[result.values.length - 1]);

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
  const buffer = findAndRead("michigan_lld.asc");
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
  eq(fastMin(lastRow, { debug: false }), -0.102997);
  eq(fastMax(lastRow, { debug: false }), 165.940948);
  eq(new Set(result.values[result.values.length - 1]).size, 3615);
  console.timeEnd("reading ascii values");
});

test("start_row", async ({ eq }) => {
  console.time("reading box of ascii values");
  const buffer = findAndRead("michigan_lld.asc");

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
  const buffer = findAndRead("michigan_lld.asc");

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

test("bbox", async ({ eq }) => {
  console.time("reading box of ascii values");
  const buffer = findAndRead("michigan_lld.asc");

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
  const buffer = findAndRead("michigan_lld.asc");

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
