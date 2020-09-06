const MAX_READ_LENGTH = 500;

module.exports = (input, options = {}) => {
  const debug = options.debug || false;
  if (typeof Buffer !== "undefined" && Buffer.isBuffer(input)) {
    if (input.toString) {
      input = input.toString("utf8", 0, MAX_READ_LENGTH);
      if (debug) console.log("converted input to a string");
    } else {
      return false;
    }
  }

  if (debug) console.log("input is:", input);

  if (input instanceof ArrayBuffer) input = new DataView(input);

  if (input instanceof DataView) {
    const decoded = "";
    const length = Math.min(MAX_READ_LENGTH, input.byteLength);
    for (let i = 0; i < length; i++) {
      decoded += String.fromCharCode(input.getUint8(i));
    }
    input = decoded;
  }

  if (input instanceof Uint8Array) {
    const decoded = "";
    for (let i = 0; i < Math.min(MAX_READ_LENGTH, input.length); i++) {
      decoded += String.fromCharCode(input[i]);
    }
    input = decoded;
  }

  if (typeof input === "string") {
    if (debug) console.log("input is a string");
    return (
      input.endsWith(".asc") ||
      input.endsWith(".ASC") ||
      (input.includes("ncols") && input.includes("nrows"))
    );
  } else {
    return false;
  }
};
