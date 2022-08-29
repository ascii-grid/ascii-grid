const flatIter = require("flat-iter");
const getDepth = require("get-depth");

const isArray = require("./is-array.js");
const isNumLike = require("./is-num-like.js");

/**
 * @name writeAsciiGrid
 * @description write ASCII-Grid text file (.asc)
 * @param {Number[]} data - a numerical array of cell values.  can be provided as one flat array of an array of rows.
 * @param {Number|String} ncols - number of columns of cells
 * @param {Number|String} nrows - number of rows of cells
 * @param {Number|String} xllcenter - x value of center of lower left cell
 * @param {Number|String} xllcorner - x value of lower left corner of lower left cell
 * @param {Number|String} yllcenter - y value of center of lower left cell
 * @param {Number|String} yllcorner - y value of lower left corner of lower left cell
 * @param {Number|String} cellsize - the height and width of the cell in units of the spatial reference system
 * @param {Number|String} nodata_value - the no data value. cells without data should be skipped when visualizing or calculating statistics.
 * @param {Boolean} strict - if strict, throw an error when necessary metadata is missing
 * @param {Boolean} debug_level- set to 1+ for increased logging
 * @param {Boolean} trailing_newline - whether to include a newline at the end of the file
 * @param {Number} fixed_digits - the number of digits after the decimal. default is no rounding. ignores nodata_values. for more explanation of the rounding please see the documentation for JavaScript's toFixed function [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)
 */
function writeAsciiGrid({
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
}) {
  if (!isArray(data)) {
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

  if (typeof ncols === "string") ncols = Number(ncols);
  if (typeof nrows === "string") nrows = Number(nrows);
  if (typeof nodata_value === "string") nodata_value = Number(nodata_value);

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

  if (isNumLike(xllcorner) && isNumLike(yllcorner)) {
    header.push("xllcorner " + xllcorner);
    header.push("yllcorner " + yllcorner);
  } else if (isNumLike(xllcenter) && isNumLike(yllcenter)) {
    header.push("xllcenter " + xllcenter);
    header.push("yllcenter " + yllcenter);
  } else if (strict) {
    throw new Error("[ascii-grid] unable to write origin because don't have both (x/y)llcorner or both (x/y)llcenter.");
  }

  if (isNumLike(cellsize)) {
    header.push("cellsize " + cellsize);
  }

  if (isNumLike(nodata_value)) {
    header.push("nodata_value " + nodata_value);
  }

  let asc = header.join("\n");

  // assuming row-major order
  if (depth === 1) {
    if (typeof ncols !== "number") {
      throw new Error("[ascii-grid] unable to determine row breaks in a flat array without ncols");
    }
  } else if (depth === 2) {
    if (typeof ncols !== "number") {
      // assuming row-major order
      ncols = data[0].length;
    }
  }

  const iter = flatIter(data, depth);

  asc += "\n";

  let c = 0;
  let it;
  let n = iter.next().value;
  if (use_fixed_digits && n !== nodata_value) n = n.toFixed(fixed_digits);
  asc += n;
  while ((it = iter.next()) && it.done === false) {
    c++;

    // start a new row
    if (c === ncols) {
      asc += "\n";
      c = 0;
    } else {
      asc += " ";
    }

    let n = it.value;
    if (use_fixed_digits && n !== nodata_value) n = n.toFixed(fixed_digits);
    asc += n;
  }

  if (trailing_newline) asc += "\n";

  return { asc };
}

if (typeof define === "function" && define.amd) {
  define(function () {
    return writeAsciiGrid;
  });
}

if (typeof module === "object") {
  module.exports = writeAsciiGrid;
  module.exports.default = writeAsciiGrid;
}
