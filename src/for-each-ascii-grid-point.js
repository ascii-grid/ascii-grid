const iterAsciiGridPoint = require("./iter-ascii-grid-point");

/**
 * @name forEachAsciiGridPoint
 * @description run a callback function on each cell in your ASCII Grid
 * @param {ArrayBuffer|Buffer|String} data
 * @param {Function} callback - calls this function for each cell with the first param being [GridPointInfo](#GridPointInfo)
 * @param {Boolean} [assume_clean=true]
 * @param {Boolean} [cache=false]
 * @param {Number} [debug_level=0]
 * @param {Number} [max_read_length=Infinity]
 * @param {Number} [start_of_data_byte]
 * @param {Number} [start_column=0]
 * @param {Number} [end_column]
 * @param {Number} [start_row=0]
 * @param {Number} [end_row]
 * @param {Object} [meta]
 * @example
 * import { forEachAsciiGridPoint } from "ascii-grid";
 *
 * forEachAsciiGridPoint({
 *  data: <ArrayBuffer>,
 *  callback: ({n, c, r }) => {
 *   console.log(`value "${n}" at row "${r}" and column "${c}"`);
 *  }
 * });
 */
module.exports = function forEachAsciiGridPoint({
  assume_clean = true,
  cache = false,
  debug_level = 0,
  data,
  max_read_length = Infinity,
  start_of_data_byte,
  start_column = 0,
  end_column, // index of last column (using zero-based index)
  start_row = 0,
  end_row, // index of last row (using zero-based index)
  meta,
  callback
}) {
  if (debug_level >= 1) console.time("[asci-grid/for-each-ascii-grid-point] took");

  const iter = iterAsciiGridPoint({
    assume_clean,
    cache,
    debug_level,
    data,
    max_read_length,
    start_of_data_byte,
    start_column,
    end_column,
    start_row,
    end_row,
    meta
  });

  let obj;
  while (((obj = iter.next()), obj.done === false)) {
    callback(obj.value);
  }

  if (debug_level >= 1) console.timeEnd("[asci-grid/for-each-ascii-grid-point] took");
};
