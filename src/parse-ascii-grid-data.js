const getByte = require("get-byte");
const parseAsciiGridMetaData = require("./parse-ascii-grid-meta");

const NEWLINE_CHARCODE = "\n".charCodeAt(0);
const SPACE_CHARCODE = " ".charCodeAt(0);
const MINUS_CHARCODE = "-".charCodeAt(0);
const ZERO_CHARCODE = "0".charCodeAt(0);
const NINE_CHARCODE = "9".charCodeAt(0);
// const NULL_CHARACTER = "\u0000".charCodeAt(0);

module.exports = async ({
  assume_clean = true,
  debug = false,
  data,
  max_read_length = Infinity,
  start_of_data_byte,
  meta
}) => {
  const result = {};
  const table = [];
  let row = [];
  let num = "";

  const read_length = Math.min(data.length, max_read_length);
  if (debug) console.log("[ascii-grid/get-values] read_length:", read_length);

  let i =
    start_of_data_byte ||
    (meta && meta.last_metadata_byte + 1) ||
    (await parseAsciiGridMetaData({ data })).last_metadata_byte + 1;

  if (debug) console.log("[ascii-grid/get-values] i:", i);

  while (i < read_length - 1) {
    i++;
    const byte = getByte(data, i);

    if (byte === NEWLINE_CHARCODE) {
      if (num !== "") row.push(parseFloat(num));
      num = "";
      table.push(row);
      row = [];
    } else if (byte === SPACE_CHARCODE) {
      if (num !== "") row.push(parseFloat(num));
      num = "";
    } else if (
      assume_clean ||
      byte === MINUS_CHARCODE ||
      byte === ZERO_CHARCODE ||
      byte === NINE_CHARCODE ||
      (byte > ZERO_CHARCODE && byte < NINE_CHARCODE)
    ) {
      num += String.fromCharCode(byte);
    }
  }

  // special case is the last byte because sometimes it's a null-byte (0)
  const lastByte = getByte(data, read_length - 1);
  if (debug) console.log("[ascii-grid/get-values] lastByte:", [lastByte]);
  if (lastByte >= ZERO_CHARCODE && lastByte <= NINE_CHARCODE) {
    num += String.fromCharCode(lastByte);
  }

  if (num !== "") row.push(num) && table.push(row);

  result.end_of_data_byte = i;

  result.values = table;

  if (debug) console.log("[ascii-grid/get-values] finishing");

  return result;
};
