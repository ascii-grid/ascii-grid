async function isAsciiGrid({ data, debug = false, max_read_length = 500 }) {
  if (data instanceof Promise) data = await data;

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(data)) {
    if (data.toString) {
      data = data.toString("utf8", 0, max_read_length);
      if (debug) console.log("converted data to a string");
    } else {
      return false;
    }
  }

  if (debug) console.log("[ascii-grid/is-ascii-grid] data is:", data);

  if (data instanceof ArrayBuffer) data = new DataView(data);

  if (data instanceof DataView) {
    let decoded = "";
    const length = Math.min(max_read_length, data.byteLength);
    for (let i = 0; i < length; i++) {
      decoded += String.fromCharCode(data.getUint8(i));
    }
    data = decoded;
  }

  if (data instanceof Uint8Array) {
    let decoded = "";
    for (let i = 0; i < Math.min(max_read_length, data.length); i++) {
      decoded += String.fromCharCode(data[i]);
    }
    data = decoded;
  }

  if (typeof data === "string") {
    if (debug) console.log("data is a string");
    return Boolean(data.match(/.asc(.gz|.tar|.tar.gz|.tgz|.zip)?$/i)) || (data.includes("ncols") && data.includes("nrows"));
  } else {
    return false;
  }
}

module.exports = isAsciiGrid;
module.exports.default = isAsciiGrid;
