const calcStats = require("calc-stats");
const parseAsciiGridMeta = require("./parse-ascii-grid-meta");
const iterAsciiGridPoint = require("./iter-ascii-grid-point");
/**
 * @name calcAsciiGridStats
 * @description Calculate Statistics for a Given ASCII Grid.  Basically runs [calc-stats](https://www.npmjs.com/package/calc-stats) on the data.
 * @param {Boolean} [assume_clean=true] - assume that cell values are valid numbers and don't include null bytes
 * @param {Number} [debug_level=0] - 0 prevents all logging, 1+ logging to help debugging
 * @param {ArrayBuffer|Buffer|String} data - your ASCII grid data
 * @param {Number} [max_read_length=Infinity] - how much to read of the ASCII grid file
 * @param {Number} [start_of_data_byte] - where the metadata ends and to start reading the cell values
 * @param {Number} [start_column=0] - which column to start reading from. zero is the furthest left column.
 * @param {Number} [end_column] - at which column to stop reading. defaults to reading to the end of the grid
 * @param {Number} [start_row] - which row to start reading from. zero is the top/first row.
 * @param {Number} [end_row] - which row to stop reading from. defaults to reading through the last row.
 * @param {Object} [meta] - metadata object from [parseAsciiGridMeta](#parseAsciiGridMeta)
 * @param {Boolean} [calcHistogram=true] - calculate a histogram of cell values
 * @param {Boolean} [calcMax=true] - calculate the maximum of all the valid cell values
 * @param {Boolean} [calcMean=true] - calculate the mean of all the valid cell values
 * @param {Boolean} [calcMedian=true] - calculate the median of all the valid cell values
 * @param {Boolean} [calcMin=true] - calculate the min of all the valid cell values
 * @param {Boolean} [calcMode=true] - calculate the most common cell value (ignoring no-data values)
 * @param {Boolean} [calcMode=true] - calculate array of the most common cell values (ignoring no-data values)
 * @param {Boolean} [calcSum=true] - calculate the sum of all cell values (ignoring no-data values)
 * @returns {CalcStatsResults} Results object from running [calc-stats](https://github.com/danieljdufour/calc-stats) over the data
 */
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
