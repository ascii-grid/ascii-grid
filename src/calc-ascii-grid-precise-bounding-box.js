const add = require("preciso/add.js");
const divide = require("preciso/divide.js");
const multiply = require("preciso/multiply.js");
const subtract = require("preciso/subtract.js");

const parseAsciiGridMeta = require("./parse-ascii-grid-meta");

/**
 * @name calcAsciiGridPreciseBoundingBox
 * @description Calculate the bounding box of the ASCII Grid using [preciso](https://github.com/danieljdufour/preciso) a library for precise mathetmical calculations that
 * avoid float-point arithemtic imprecision.  This is the more precise (but slower) version of [calcAsciiGridBoundingBox](#calcasciigridboundingbox).
 * @param {ArrayBuffer|Buffer|String} data - your ASCII grid data
 * @param {Number} [debug_level=0] - 0 prevents all logging, 1+ logging to help debugging
 * @param {Number} [max_read_length=Infinity] - how much to read of the ASCII grid file
 * @param {Object} [meta] - metadata object from [parseAsciiGridMeta](#parseAsciiGridMeta)
 * @returns {Array<String>} bounding box in numerical string format [xmin, ymin, xmax, ymax]
 *
 * @example
 * import { calcAsciiGridPreciseBoundingBox } from "ascii-grid";
 *
 * calcAsciiGridPreciseBoundingBox({
 *  data: <ArrayBuffer>
 * });
 * ["491501", "2556440", "594634.0933", "2645315.3392"]
 */
module.exports = function calcAsciiGridPreciseBoundingBox({ data, debug_level, max_read_length, meta }) {
  if (!meta) meta = parseAsciiGridMeta({ data, debug: debug_level >= 1, max_read_length, raw: true });

  let xmin, ymin, xmax, ymax;

  const cellsize = meta.cellsize.toString();

  if ("xllcenter" in meta) {
    xmin = subtract(meta.xllcenter.toString(), divide(cellsize, "2"));
  } else if ("xllcorner" in meta) {
    xmin = meta.xllcorner.toString();
  }
  xmax = add(xmin, multiply(meta.ncols.toString(), cellsize));

  if ("yllcenter" in meta) {
    ymin = subtract(meta.yllcenter.toString(), divide(cellsize, "2"));
  } else if ("yllcorner" in meta) {
    ymin = meta.yllcorner.toString();
  }
  ymax = add(ymin, multiply(meta.nrows.toString(), cellsize));

  return [xmin, ymin, xmax, ymax];
};
