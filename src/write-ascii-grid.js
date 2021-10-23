const getDepth = require("get-depth");

/**
 * @name writeAsciiGrid
 * @description write ASCII-Grid text file (.asc)
 * @param {Number[]} data - a numerical array of cell values.  can be provided as one flat array of an array of rows.
 * @param {Number} ncols - number of columns of cells
 * @param {Number} nrows - number of rows of cells
 * @param {Number} xllcenter - x value of center of lower left cell
 * @param {Number} xllcorner - x value of lower left corner of lower left cell
 * @param {Number} yllcenter - y value of center of lower left cell
 * @param {Number} yllcorner - y value of lower left corner of lower left cell
 * @param {Number} cellsize - the height and width of the cell in units of the spatial reference system
 * @param {Number} nodata_value - the no data value. cells without data should be skipped when visualizing or calculating statistics.
 * @param {Boolean} strict - if strict, throw an error when necessary metadata is missing
 * @param {Boolean} debug_level- set to 1+ for increased logging
 * @param {Boolean} trailing_newline - whether to include a newline at the end of the file
 * @param {Number} fixed_digits - the number of digits after the decimal. default is no rounding. ignores nodata_values. for more explanation of the rounding please see the documentation for JavaScript's toFixed function [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)
 */
module.exports = ({
  data,
  ncols,
  nrows,
  xllcenter,
  xllcorner,
  yllcenter,
  yllcorner,
  cellsize,
  nodata_value,
  strict = true,
  debug_level = 0,
  trailing_newline = true,
  fixed_digits
}) => {
  if (!Array.isArray(data)) {
    throw new Error("[ascii-grid] data does not appear to be an array");
  }

  if (strict && xllcenter === undefined && xllcorner === undefined) {
    throw new Error(`[ascii-grid] must provided either "xllcenter" or "xllcorner"`);
  }

  if (strict && yllcenter === undefined && yllcorner === undefined) {
    throw new Error(`[ascii-grid] must provided either "xllcenter" or "xllcorner"`);
  }

  const use_fixed_digits = typeof fixed_digits === "number";

  const header = [];

  const depth = getDepth(data);
  if (debug_level >= 1) console.log("[ascii-grid] depth: " + depth);

  if (ncols === undefined) {
    if (depth === 1 && typeof nrows == "number") {
      ncols = data.length / nrows;
    } else if (depth === 2) {
      ncols = data[0].length;
    } else if (strict) {
      throw new Error(`[ascii-grid] unable to determine "ncols". please provide "ncols" and/or "nrows"`);
    }
  }

  if (nrows === undefined) {
    if (depth === 1 && typeof ncols === "number") {
      nrows = data.length / ncols;
    } else if (depth === 2) {
      nrows = data.length;
    } else if (strict) {
      throw new Error(`[ascii-grid] unable to determine "ncols". please provide "ncols" and/or "nrows"`);
    }
  }

  // add header lines
  if (typeof ncols === "number") header.push("ncols " + ncols);
  if (typeof nrows === "number") header.push("nrows " + nrows);

  if (typeof xllcorner === "number" && typeof yllcorner === "number") {
    header.push("xllcorner " + xllcorner);
    header.push("yllcorner " + yllcorner);
  } else if (typeof xllcenter === "number" && typeof yllcenter === "number") {
    header.push("xllcenter " + xllcenter);
    header.push("yllcenter " + yllcenter);
  } else if (strict) {
    throw new Error("[ascii-grid] unable to write origin because don't have both (x/y)llcorner or both (x/y)llcenter.");
  }

  if (typeof cellsize === "number") header.push("cellsize " + cellsize);

  if (typeof nodata_value === "number") header.push("nodata_value " + nodata_value);

  let asc = header.join("\n");

  if (depth === 1) {
    if (typeof ncols !== "number") {
      throw new Error("[ascii-grid] unable to determine row breaks in a flat array without ncols");
    }
    // flat array
    let c = 0;

    // start with a new line
    asc += "\n" + data[0];
    for (let i = 0; i < data.length; i++) {
      c++;

      // start a new row
      if (c === ncols) {
        asc += "\n";
        c === 0;
      } else {
        asc += " ";
      }

      let n = data[i];
      if (use_fixed_digits && n !== nodata_value) n = n.toFixed(fixed_digits);
      asc += n;
    }
  } else if (depth == 2) {
    if (debug_level >= 3) console.log("[ascii-grid] data:", data);
    data.forEach(row => {
      if (debug_level >= 4) console.log("[ascii-grid] row:", row);
      asc += "\n";
      if (use_fixed_digits) row = row.map(n => (n === nodata_value ? n : n.toFixed(fixed_digits)));
      asc += row.join(" ");
    });
  }

  if (trailing_newline) asc += "\n";

  return { asc };
};
