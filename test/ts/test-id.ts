import test from "flug";
import findAndRead from "find-and-read";
import toab from "toab";
import { isAsciiGrid } from "../../";

test("identifying ascii grid file extensions", async ({ eq }) => {
  eq(await isAsciiGrid({ data: "michigan_lld.asc" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.tar" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.tar.gz" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.zip" }), true);
  eq(await isAsciiGrid({ data: "michigan_lld.asc.json" }), false);
});

test("identifying ascii grid file from buffers", async ({ eq }) => {
  const buffer = findAndRead("michigan_lld.asc");
  const bufferIsAsciiGrid = await isAsciiGrid({ data: buffer, debug: false });
  eq(bufferIsAsciiGrid, true);
  // @ts-ignore
  const uint8Array = Uint8Array.from(buffer);
  eq(await isAsciiGrid({ data: uint8Array }), true);
  eq(await isAsciiGrid({ data: await toab(buffer) }), true);
});
