const parseAsciiGridMeta = require("./parse-ascii-grid-meta");
const forEachAsciiGridPoint = require("./for-each-ascii-grid-point");

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
  calcMinimum = true,
  calcMaximum = true,
  calcMean = true,
  calcMedian = true,
  calcMode = true
}) {
  if (!meta) meta = parseAsciiGridMeta({ data, debug: debug_level >= 1, max_read_length });

  const { nodata_value } = meta;

  let max = -Infinity;
  let min = Infinity;
  let sum = 0;
  let count = 0;

  const histogram = calcMedian || calcMode || calcHistogram ? {} : null;

  forEachAsciiGridPoint({
    assume_clean,
    debug_level,
    data,
    max_read_length,
    start_of_data_byte,
    start_column,
    end_column,
    start_row,
    end_row,
    meta,
    callback: ({ num }) => {
      if (num !== nodata_value) {
        count++;
        sum += num;
        if (num < min) min = num;
        if (num > max) max = num;
        if (histogram) {
          if (num in histogram) histogram[num].ct++;
          else histogram[num] = { num, ct: 1 };
        }
      }
    }
  });

  const result = {};
  if (calcHistogram) result.histogram = histogram;
  if (calcMean) result.mean = sum / count;
  if (calcMinimum) result.minimum = min;
  if (calcMaximum) result.maximum = max;

  if (calcMode) {
    let highest_count = 0;
    let modes = [];
    for (let key in histogram) {
      const { num, ct } = histogram[key];
      if (ct === highest_count) {
        modes.push(num);
      } else if (ct > highest_count) {
        highest_count = ct;
        modes = [num];
      }
    }

    // compute mean value of all the most popular grid point values
    result.mode = modes.reduce((acc, n) => acc + n, 0) / modes.length;
  }

  if (calcMedian) {
  }

  return result;
}

module.exports = calcAsciiGridStats;
