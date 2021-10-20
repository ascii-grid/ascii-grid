const test = require("flug");
const findAndRead = require("find-and-read");
const toab = require("toab");
const isAsciiGrid = require("../src/is-ascii-grid");

test("identifying ascii grid file extensions", async ({ eq }) => {
  eq(await isAsciiGrid({ data: "michigan_lld.asc" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.tar" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.tar.gz" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.zip" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.json" }), false);
});

test("identifying ascii grid file from buffers", async ({ eq }) => {
  const buffer = findAndRead("michigan_lld.asc");
  const bufferIsAsciiGrid = await isAsciiGrid({ data: buffer, debug_level: 0 });
  eq(bufferIsAsciiGrid, true);
  eq(await isAsciiGrid({ data: Uint8Array.from(buffer) }), true);
  eq(await isAsciiGrid({ data: await toab(buffer) }), true);
});
