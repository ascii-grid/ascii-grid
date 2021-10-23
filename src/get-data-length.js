/**
 * @name getDataLength
 * @description gets the length of your ASCII Grid data.  If it's a string, return the string length.  If it's a typed array, return the length.  If it's binary (e.g. ArrayBuffer and Buffer), return the number of bytes,
 * @param {Object} input
 * @param {ArrayBuffer|Buffer|String} input.data - your data
 */
module.exports = function getDataLength({ data }) {
  if (!data) throw new Error("[ascii-grid/get-data-length] can't get length of nothing!");
  let data_length;
  if (typeof data === "string") {
    data_length = data.length;
  } else if (typeof data === "object") {
    if (typeof data.length === "number") {
      data_length = data.length;
    } else if (typeof data.byteLength === "number") {
      data_length = data.byteLength;
    }
  }
  if (data_length === null) throw new Error("[ascii-grid/get-data-length] unable to calculate length of data");
  return data_length;
};
