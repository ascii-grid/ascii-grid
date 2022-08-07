const test = require("flug");
const findAndRead = require("find-and-read");
const parseAsciiGridMeta = require("../src/parse-ascii-grid-meta");
const parseAsciiGridData = require("../src/parse-ascii-grid-data");
const writeAsciiGrid = require("../src/write-ascii-grid");

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

    const written = writeAsciiGrid({ data: values, debug_level: 0, fixed_digits, trailing_newline, ...meta });
    eq(written.asc, str);

    const written_3d = writeAsciiGrid({ data: [values], debug_level: 0, fixed_digits, trailing_newline, ...meta });
    eq(written_3d.asc, str);
  });
});
