const test = require("flug");
const findAndRead = require("find-and-read");

const parseAsciiGridMetaData = require("../src/parse-ascii-grid-meta");
const parseAsciiGridData = require("../src/parse-ascii-grid-data");

test("source type equivalency", async ({ eq }) => {
  const buffer = findAndRead("keypad.asc");
  const meta_from_buffer = parseAsciiGridMetaData({ data: buffer, debug_level: 0 });

  const string = findAndRead("keypad.asc", { encoding: "utf-8" });
  const meta_from_string = parseAsciiGridMetaData({ data: string, debug_level: 0 });
  eq(meta_from_buffer, meta_from_string);
});

test("reading string", async ({ eq }) => {
  const str = findAndRead("keypad.asc", { encoding: "utf-8" });
  const result = parseAsciiGridData({ data: str, check_fixed_digits: true });
  eq(Object.keys(result), ["fixed_digits", "values"]);
  eq(result.fixed_digits, 0);
  eq(result.values, [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ]);
});

test("keypad", async ({ eq }) => {
  const buffer = findAndRead("keypad.asc");
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
