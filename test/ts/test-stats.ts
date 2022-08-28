import test from "flug";
import findAndRead from "find-and-read";
import { calcAsciiGridStats } from "../..";

test("stats", ({ eq }) => {
  console.time("stats");
  const buffer = findAndRead("Necker_20m.asc");
  const stats = calcAsciiGridStats({ data: buffer });
  eq(Object.keys(stats.histogram).length > 100, true);
  delete stats.histogram;
  eq(stats, {
    median: -337.552,
    min: -1500,
    max: -1.02875,
    sum: -728318209.6027229,
    mean: -413.0738662887423,
    modes: [-1485],
    mode: -1485
  });
  console.timeEnd("stats");
});
