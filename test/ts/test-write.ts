import test from "flug";
import findAndRead from "find-and-read";
import { parseAsciiGridMeta, parseAsciiGridData, writeAsciiGrid } from "../../src";

declare const performance: any;

// we don't test Neck_20m.asc because it is poorly formed
// where each value is separated by a new line instead of a space
["keypad", "michigan_lld"].forEach(filename => {
  test("re-write " + filename, async ({ eq }) => {
    console.log("running: " + "re-write " + filename);
    const str = findAndRead(filename + ".asc", { encoding: "utf-8" });

    const last_char = str[str.length - 1];

    const trailing_newline = last_char === "\n";

    const meta = parseAsciiGridMeta({ data: str });
    const { fixed_digits, values } = parseAsciiGridData({ data: str, check_fixed_digits: true });

    const start = performance.now();
    const written = writeAsciiGrid({ data: values, debug_level: 0, fixed_digits, trailing_newline, ...meta });
    const end = performance.now();
    eq(written.asc, str);
    console.log("took " + ((end - start) / 1000).toFixed(7) + "s");

    const written_3d = writeAsciiGrid({ data: [values], debug_level: 0, fixed_digits, trailing_newline, ...meta });
    eq(written_3d.asc, str);
  });
});

test("writing typed array", ({ eq }) => {
  const str = findAndRead("keypad.asc", { encoding: "utf-8" });
  const meta = parseAsciiGridMeta({ data: str });
  const last_char = str[str.length - 1];
  const trailing_newline = last_char === "\n";
  let { fixed_digits, values } = parseAsciiGridData({ data: str, check_fixed_digits: true });
  const typedValues = Float32Array.from(values.flat());
  const written = writeAsciiGrid({ data: typedValues, debug_level: 0, fixed_digits, trailing_newline, ...meta });
  eq(written.asc, str);
});

test("writing strings", ({ eq }) => {
  const start_test = performance.now();
  const s = performance.now();
  const data = new Uint8Array(101 * 101).fill(2);
  const e = performance.now();
  console.log("creating array " + ((e - s) / 1000).toFixed(7) + "s");
  const meta = {
    cellsize: "0.0000277777778",
    nodata_value: undefined,
    ncols: "101",
    nrows: "101",
    strict: true,
    debug_level: 0,
    trailing_newline: true,
    fixed_digits: undefined,
    xllcorner: "9.0010573796",
    yllcorner: "51.9985704523422"
  };
  const start = performance.now();
  const { asc } = writeAsciiGrid({ data, ...meta });
  const end = performance.now();
  console.log("took " + ((end - start) / 1000).toFixed(7) + "s");
  eq(asc.includes("cellsize"), true);
  const end_test = performance.now();
  console.log("test took " + ((end_test - start_test) / 1000).toFixed(7) + "s");
});
