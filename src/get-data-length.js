module.exports = ({ data }) => {
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
