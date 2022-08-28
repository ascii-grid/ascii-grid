import test from "flug";
import toab from "toab";
import findAndRead from "find-and-read";
import { iterAsciiGridPoint } from "../../src";

const buffer = findAndRead("michigan_lld.asc");

const NCOLS = 4201;
const NROWS = 5365;

const check = ({ data, eq }: { data: any; eq: (a: any, b: any) => void }) => {
  const iterator = iterAsciiGridPoint({ data, debug_level: 0 });
  const first = iterator.next();
  delete first.value.meta;
  eq(first, { value: { c: 0, r: 0, num: -9999, str: "-9999" }, done: false });

  let i = 1;
  let obj;
  while (((obj = iterator.next()), obj.done === false)) {
    i++;
    eq(obj.done, false);
    eq(Object.keys(obj.value).sort(), ["c", "r", "num", "meta", "str"].sort());
  }
  eq(Object.keys(obj.value), ["meta"]);
  eq(obj.done, true);
  eq(i, NCOLS * NROWS);
};

test("iter buffer", async ({ eq }) => {
  console.log("starting: iter buffer");
  check({ data: buffer, eq });
});

test("iter array buffer", async ({ eq }) => {
  console.log("starting: iter array buffer");
  const ab = await toab(buffer);
  check({ data: ab, eq });
});
