module.exports = ({ data }) => {
  if (!data) throw new Error("[ascii-grid/get-data-length] can't get length of nothing!");
  const data_length = "length" in data ? data.length : "byteLength" in data ? data.byteLength : null;
  if (data_length === null) throw new Error("[ascii-grid/get-data-length] unable to calculate length of data");
  return data_length;
};
