const NEWLINE_CHARCODE = "\n".charCodeAt(0);

module.exports = (input, options = {}) => {
  const debug = options.debug || false;

  const result = {};
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(input)) {
    let i = 0;

    // parse metadata
    let line = null;

    const read_length = Math.min(input.length, max_read_length);
    for (i = 0; i < read_length; i++) {
      const char = String.fromCharCode(input[i]);
      if (char === "\n") {
        const [param, value] = line.split(" ");
        result[param] = Number.parseFloat(value);
        line = null;
      } else if (line === null) {
        if (
          ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(char)
        ) {
          break;
        } else {
          line = char;
        }
      } else {
        line += char;
      }
    }
  }

  if (input instanceof ArrayBuffer) input = new DataView(input);

  if (input instanceof DataView) {
    const decoded = "";
    input = decoded;
  }
  if (debug) console.log("result:", result);
  return result;
};
