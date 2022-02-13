const getByte = require("get-byte");
const getDataLength = require("./get-data-length");

const cached = new Map();

module.exports = ({ cache = false, data, debug_level = 0, max_read_length = 500, raw = false }) => {
  if (cache && cached.has(data)) return cached.get(data);

  const result = {};

  let i = 0;

  let line_count = 0;
  // parse metadata
  let line = null;

  const data_length = getDataLength({ data });
  if (debug_level >= 1) console.log("[ascii-grid] data_length: " + data_length);

  const read_length = Math.min(data_length, max_read_length);
  if (debug_level >= 1) console.log("[ascii-grid] read_length: " + read_length);

  const data_type = typeof data;

  for (i = 0; i < read_length; i++) {
    let char;
    if (data_type === "string") {
      char = data[i];
    } else {
      const byte = getByte(data, i);
      char = String.fromCharCode(byte);
    }

    if (char === "\n") {
      const [param, value] = line.split(" ");
      if (raw) {
        result[param] = value;
      } else {
        result[param] = Number.parseFloat(value);
      }
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

  if (debug_level >= 1) console.log("meta result:", result);

  if (cache) cached.set(data, result);

  return result;
};
