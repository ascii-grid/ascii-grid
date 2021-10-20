const getByte = require("get-byte");
const getDataLength = require("./get-data-length");

const cached = new Map();

module.exports = ({ cache = false, data, debug = false, max_read_length = 500 }) => {
  if (cache && cached.has(data)) return cached.get(data);

  const result = {};

  let i = 0;

  let line_count = 0;
  // parse metadata
  let line = null;

  const data_length = getDataLength({ data });

  const read_length = Math.min(data_length, max_read_length);
  for (i = 0; i < read_length; i++) {
    const byte = getByte(data, i);
    const char = String.fromCharCode(byte);
    if (char === "\n") {
      const [param, value] = line.split(" ");
      result[param] = Number.parseFloat(value);
      line = null;
      line_count++;
    } else if (line === null) {
      if (["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(char)) {
        break;
      } else {
        line = char;
      }
    } else {
      line += char;
    }
  }

  // add line that marks where metadata ends
  result.last_metadata_line = line_count - 1;
  result.last_metadata_byte = i - 1;

  if (debug) console.log("meta result:", result);

  if (cache) cached.set(data, result);

  return result;
};
