const iterAsciiGridPoint = require("./iter-ascii-grid-point");

module.exports = ({
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
  callback
}) => {
  if (debug_level >= 1) console.time("[asci-grid/for-each-point] took");

  const iter = iterAsciiGridPoint({
    assume_clean,
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

  if (debug_level >= 1) console.timeEnd("[asci-grid] parse-ascii-grid-data took");
};
