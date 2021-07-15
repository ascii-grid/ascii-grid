const calcStats = require("calc-stats");
const parseAsciiGridMeta = require("./parse-ascii-grid-meta");
const iterAsciiGridPoint = require("./iter-ascii-grid-point");

function calcAsciiGridStats({
  assume_clean = true,
  debug_level = 0,
  data,
  max_read_length = Infinity,
  start_of_data_byte,
  start_column = 0,
  end_column, // index of last column (using zero-based index)
  start_row = 0,
  end_row, // index of last row (using zero-based index)
  meta,
  calcHistogram = true,
  calcMax = true,
  calcMean = true,
  calcMedian = true,
  calcMin = true,
  calcMode = true,
  calcModes = true,
  calcSum = true
}) {
  if (!meta) meta = parseAsciiGridMeta({ data, debug: debug_level >= 1, max_read_length });
  const { nodata_value } = meta;
  const iterObj = iterAsciiGridPoint({
    assume_clean,
    data,
    start_of_data_byte,
    start_column,
    end_column,
    start_row,
    end_row,
    meta
  });
  const iterNum = {
    next: () => {
      let obj;
      // iterate until we reach the end or get a valid value
      while ((obj = iterObj.next())) {
        const { done, value } = obj;
        if (done) return { done };
        const { num } = value;
        if (num !== nodata_value) return { done, value: num };
      }
    }
  };

  const stats = calcStats(iterNum, {
    calcHistogram,
    calcMax,
    calcMean,
    calcMedian,
    calcMin,
    calcMode,
    calcModes,
    calcSum
  });

  return stats;
}

module.exports = calcAsciiGridStats;
