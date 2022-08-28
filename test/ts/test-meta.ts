import test from "flug";
import findAndRead from "find-and-read";
import { parseAsciiGridMeta } from "../../src";

test("reading ascii metadata", async ({ eq }) => {
  const buffer = findAndRead("michigan_lld.asc");
  const meta = parseAsciiGridMeta({ data: buffer, debug_level: 0 });

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

test("caching ascii metadata", ({ eq }) => {
  const buffer = findAndRead("michigan_lld.asc");
  const meta = parseAsciiGridMeta({ cache: true, data: buffer, debug_level: 0 });
  const cached = parseAsciiGridMeta({ cache: true, data: buffer, debug_level: 0 });
  eq(meta === cached, true);
});

test("reading ascii metadata raw", async ({ eq }) => {
  const buffer = findAndRead("michigan_lld.asc");
  const meta = parseAsciiGridMeta({ data: buffer, debug_level: 0, raw: true });

  // check metadata
  eq(meta.ncols, "4201");
  eq(meta.nrows, "5365");
  eq(meta.xllcenter, "-88");
  eq(meta.yllcenter, "41.62");
  eq(meta.cellsize, "0.0008333333333");
  eq(meta.nodata_value, "-9999");
  eq(meta.last_metadata_line, 5);
  eq(meta.last_metadata_byte, 95);
});
