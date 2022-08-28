const forEachAsciiGridPoint = require("./for-each-ascii-grid-point");
const countDigits = require("./count-digits");

/*
  Notes: .asc files can end with a newline, null byte, or number

  Maybe we should return what the file ended with
  and if numbers have fixed value length (number of digits)
*/

/**
 * @name parseAsciiGridData
 * @returns
 */

module.exports = function parseAsciiGridData({
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
  flat = false,
  check_fixed_digits = false // return fixed_digits (the number of fixed digits if applicable)
}) {
  if (debug_level >= 1) console.time("[ascii-grid] parseAsciiGridData took");

  const result = {};
  const values = [];
  let row = [];
  let previous_row_index;
  let i = 0;

  // undefined = initial
  // null = inconsistent/no
  // Number = current
  let fixed_digits;

  const updateFixedDigits = ({ num, str, meta }) => {
    if (check_fixed_digits && num !== meta.nodata_value) {
      const num_digits = countDigits(str);
      // console.log({ str, num, num_digits, fixed_digits });
      if (fixed_digits === undefined) {
        fixed_digits = num_digits;
      } else if (fixed_digits !== null && num_digits !== fixed_digits) {
        fixed_digits = null;
      }
    }
  };

  forEachAsciiGridPoint({
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
    meta,
    callback: flat
      ? ({ meta, num, str }) => {
          updateFixedDigits({ num, str, meta });
          values.push(num);
        }
      : ({ meta, r, num, str }) => {
          updateFixedDigits({ num, str, meta });
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

  if (check_fixed_digits) result.fixed_digits = fixed_digits;

  result.values = values;

  if (debug_level >= 1) console.log("[ascii-grid/parse-ascii-grid-data] finishing");

  if (debug_level >= 1) console.timeEnd("[ascii-grid] parseAsciiGridData took");
  return result;
};
