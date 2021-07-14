const getByte = require("get-byte");
const parseAsciiGridMetaData = require("./parse-ascii-grid-meta");
const forEachAsciiGridPoint = require("./for-each-ascii-grid-point");

const NEWLINE_CHARCODE = "\n".charCodeAt(0);
const SPACE_CHARCODE = " ".charCodeAt(0);
const MINUS_CHARCODE = "-".charCodeAt(0);
const ZERO_CHARCODE = "0".charCodeAt(0);
const NINE_CHARCODE = "9".charCodeAt(0);
const DOT_CHARCODE = ".".charCodeAt(0);
const NULL_CHARCODE = 0;

/*
  Notes: .asc files can end with a newline, null byte, or number
*/

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
  flat = false
}) => {
  if (debug_level >= 1) console.time("[asci-grid] parse-ascii-grid-data took");

  const result = {};
  const values = [];
  let row = [];
  let previous_row_index;
  let i = 0;

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
    callback: flat
      ? ({ num }) => values.push(num)
      : ({ r, num }) => {
          if (i === 0) {
            row.push(num);
          } else if (r !== previous_row_index) {
            values.push(row);
            row = [num];
          } else {
            row.push(num);
          }

          i++;
          previous_row_index = r;
        }
  });

  // make sure don't forget about the last row
  if (!flat && Array.isArray(row) && row.length > 0) {
    values.push(row);
  }

  result.values = values;

  if (debug_level >= 1) console.log("[ascii-grid/parse-ascii-grid-data] finishing");

  if (debug_level >= 1) console.timeEnd("[asci-grid] parse-ascii-grid-data took");
  return result;
};
