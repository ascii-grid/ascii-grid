const getByte = require("get-byte");
const getDataLength = require("./get-data-length");
const parseAsciiGridMetaData = require("./parse-ascii-grid-meta");

const NEWLINE_CHARCODE = "\n".charCodeAt(0);
const SPACE_CHARCODE = " ".charCodeAt(0);
const MINUS_CHARCODE = "-".charCodeAt(0);
const ZERO_CHARCODE = "0".charCodeAt(0);
const NINE_CHARCODE = "9".charCodeAt(0);
const DOT_CHARCODE = ".".charCodeAt(0);
const NULL_CHARCODE = 0;

/**
 * @typedef {Object} GridPointInfo
 * @param {number} c - the column by zero-index
 * @param {number} r - the row by zero-index
 * @param {number} num - the cell value as a number
 * @param {String} str - the raw string cell value
 * @param {Object} meta - metadata parsed from the header of the ASCII Grid data
 */

/*
  Notes: .asc files can end with a newline, null byte, or number
*/

module.exports = ({
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
}) => {
  let numstr = "";

  if (end_column < start_column) throw new Error("[ascii-grid/iter-each-point] end_column must be greater than or equal to start_column");
  if (end_row < start_row) throw new Error("[ascii-grid/iter-each-point] end_row must be greater than or equal to start_row");

  if (!data) throw new Error("[ascii-grid/iter-each-point] can't iterate without data!");

  const data_type = typeof data;

  const data_length = getDataLength({ data });

  const read_length = Math.min(data_length, max_read_length);
  if (debug_level >= 1) console.log("[ascii-grid/iter-each-point] read_length:", read_length);

  if (!meta) meta = parseAsciiGridMetaData({ cache, data, max_read_length });
  if (debug_level >= 1) console.log("[ascii-grid/iter-each-point] meta:", meta);

  if (!end_row) end_row = meta.nrows - 1;
  if (debug_level >= 1) console.log("[ascii-grid/iter-each-point] end_row:", end_row);

  if (!end_column) end_column = meta.ncols - 1;
  if (debug_level >= 1) console.log("[ascii-grid/iter-each-point] end_column:", end_column);

  let i = start_of_data_byte !== undefined ? start_of_data_byte : meta.last_metadata_byte + 1;
  if (debug_level >= 1) console.log("[ascii-grid/iter-each-point] i:", i);

  // index of current row
  let r = 0;

  // index of current column
  let c = 0;

  // previous character
  let prev;

  if (data_type === "string") {
    return {
      next: () => {
        let ret;
        while (i <= read_length) {
          const char = i === read_length ? "\x00" : data[i];
          if (debug_level >= 2) console.log("[ascii-grid/iter-each-point] i, char:", JSON.stringify([i, char]));
          if (char === " " || char === "\n" || char === "\x00") {
            if (prev === " " || prev === "\n" || prev === "\x00") {
              // don't do anything because have reached weird edge case
              // where file has two white space characters in a row
              // for example, a new line + space before the start of the next row's data
              prev = char;
              i++;
              continue;
            }

            if (numstr !== "" && c >= start_column && c <= end_column) {
              const num = parseFloat(numstr);
              if (r >= start_row && r <= end_row) {
                ret = {
                  value: { c, r, num, str: numstr, meta },
                  done: false
                };
              }
            } else {
              if (debug_level >= 2) console.log("[ascii-grid/iter-each-point] skipping value at [", r, "][", c, "]");
            }

            numstr = "";

            // reached end of the row
            if (c == meta.ncols - 1) {
              r++;
              c = 0;
            } else {
              c++;
            }
          } else if (assume_clean || "-0123456789.".includes(char)) {
            numstr += char;
          } else if (debug_level >= 2) {
            console.error("[ascii-grid/iter-each-point]: unknown char", [char]);
          }

          prev = char;
          i++;
          if (ret) return ret;
        }
        return {
          value: { meta },
          done: true
        };
      }
    };
  } else {
    return {
      next: () => {
        let ret;
        while (i <= read_length) {
          // add phantom null byte to end, because of the processing algo
          const byte = i === read_length ? NULL_CHARCODE : getByte(data, i);

          if (debug_level >= 2) console.log("[ascii-grid/iter-each-point] i, byte:", [i, String.fromCharCode(byte)]);

          if (byte === SPACE_CHARCODE || byte === NEWLINE_CHARCODE || byte === NULL_CHARCODE) {
            if (prev === SPACE_CHARCODE || prev === NEWLINE_CHARCODE || prev === NULL_CHARCODE) {
              // don't do anything because have reached weird edge case
              // where file has two white space characters in a row
              // for example, a new line + space before the start of the next row's data
              prev = byte;
              i++;
              continue;
            }

            if (numstr !== "" && c >= start_column && c <= end_column) {
              const num = parseFloat(numstr);
              if (r >= start_row && r <= end_row) {
                ret = {
                  value: { c, r, num, str: numstr, meta },
                  done: false
                };
              }
            } else {
              if (debug_level >= 2) console.log("[ascii-grid/iter-each-point] skipping value at [", r, "][", c, "]");
            }

            numstr = "";

            // reached end of the row
            if (c == meta.ncols - 1) {
              r++;
              c = 0;
            } else {
              c++;
            }
          } else if (
            assume_clean ||
            byte === MINUS_CHARCODE ||
            byte === ZERO_CHARCODE ||
            byte === NINE_CHARCODE ||
            byte === DOT_CHARCODE ||
            (byte > ZERO_CHARCODE && byte < NINE_CHARCODE)
          ) {
            numstr += String.fromCharCode(byte);
          } else if (debug_level >= 2) {
            console.error("[ascii-grid/iter-each-point]: unknown byte", [byte]);
          }

          prev = byte;
          i++;
          if (ret) return ret;
        }
        return {
          value: { meta },
          done: true
        };
      }
    };
  }
};
