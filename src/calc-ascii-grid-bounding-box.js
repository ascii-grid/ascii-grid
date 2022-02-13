const parseAsciiGridMeta = require("./parse-ascii-grid-meta");

/**
 * @name calcAsciiGridBoundingBox
 * @description Calculate the bounding box of the ASCII Grid using fast but imprecise floating-point arithmetic.
 * For a slower, but more precise bounding box calculation, use [calcAsciiGridPreciseBoundingBox](#calcasciigridpreciseboundingbox).
 * @param {ArrayBuffer|Buffer|String} data - your ASCII grid data
 * @param {Number} [debug_level=0] - 0 prevents all logging, 1+ logging to help debugging
 * @param {Number} [max_read_length=Infinity] - how much to read of the ASCII grid file
 * @param {Object} [meta] - metadata object from [parseAsciiGridMeta](#parseAsciiGridMeta)
 * @returns {Array<Number>} bounding box in numerical format [xmin, ymin, xmax, ymax]
 *
 * @example
 * import { calcAsciiGridBoundingBox } from "ascii-grid";
 *
 * calcAsciiGridBoundingBox({
 *  data: <ArrayBuffer>
 * });
 * [491501, 2556440, 594634.0933000001, 2645315.3392]
 */
module.exports = function calcAsciiGridBoundingBox({ data, debug_level, max_read_length, meta }) {
  if (!meta) meta = parseAsciiGridMeta({ data, debug: debug_level >= 1, max_read_length });

  const bbox = {};

  if ("xllcenter" in meta) {
    bbox.xmin = meta.xllcenter - meta.cellsize / 2;
  } else if ("xllcorner" in meta) {
    bbox.xmin = meta.xllcorner;
  }
  bbox.xmax = bbox.xmin + meta.ncols * meta.cellsize;

  if ("yllcenter" in meta) {
    bbox.ymin = meta.yllcenter - meta.cellsize / 2;
  } else if ("yllcorner" in meta) {
    bbox.ymin = meta.yllcorner;
  }
  bbox.ymax = bbox.ymin + meta.nrows * meta.cellsize;
  return [bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax];
};
