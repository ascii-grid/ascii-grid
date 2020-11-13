module.exports = (input, options = {}) => {
  const debug = options.debug || false;
  const max_read_length = options.max_read_length || 500;

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(input)) {
    if (input.toString) {
      input = input.toString("utf8", 0, max_read_length);
      if (debug) console.log("converted input to a string");
    } else {
      return false;
    }
  }

  if (debug) console.log("input is:", input);

  if (input instanceof ArrayBuffer) input = new DataView(input);

  if (input instanceof DataView) {
    const decoded = "";
    const length = Math.min(max_read_length, input.byteLength);
    for (let i = 0; i < length; i++) {
      decoded += String.fromCharCode(input.getUint8(i));
    }
    input = decoded;
  }

  if (input instanceof Uint8Array) {
    let decoded = "";
    for (let i = 0; i < Math.min(max_read_length, input.length); i++) {
      decoded += String.fromCharCode(input[i]);
    }
    input = decoded;
  }

  if (typeof input === "string") {
    if (debug) console.log("input is a string");
    return (
      Boolean(input.match(/.asc(.gz|.tar|.tar.gz|.tgz|.zip)?$/i)) ||
      (input.includes("ncols") && input.includes("nrows"))
    );
  } else {
    return false;
  }
};
