# ascii-grid: beta
> Identify and Read an ARC/INFO ASCII Grid

# motivation
I do a lot of client-side geoprocessing (see [geoblaze](http://github.com/geotiff/geoblaze)) and wanted to add support for .asc files.
When I encountered large .asc files, I quickly ran out of memory because I was trying to load the whole file into memory.
This package was created to make it easy to read specific areas of an ASCII Grid in a memory-safe way and prevent my laptop from overheating.

# usage
## identify ascii grid files
isAsciiGrid identifies ASCII GRID files in the following formats: ArrayBuffer, Buffer, DataView, Promise, String, and Uint8Array
```javascript
const isAsciiGrid = require("ascii-grid/is-ascii-grid");

const buffer = readFileSync('./test_data/michigan_lld/michigan_lld.asc');
isAsciiGrid({ data: buffer, debug: false });
// true
```

## parse ascii grid metadata
```javascript
const parseAsciiGridMeta = require("ascii-grid/parse-ascii-grid-meta");

const buffer = readFileSync('./test_data/michigan_lld/michigan_lld.asc');
const metadata = parseAsciiGridMeta({ data: buffer, debug: false });
/*
{
  ncols: 4201,
  nrows: 5365,
  xllcenter: -88,
  yllcenter: 41.62,
  cellsize: 0.0008333333333,
  nodata_value: -9999,
  last_metadata_line: 5,
  last_metadata_byte: 95
}
*/
```

## Reading Pixel Values
```javascript
const parseAsciiGridData = require("ascii-grid/parse-ascii-grid-data");

const result = await parseAsciiGridData({ data: buffer, debug: true });
/*
 result is an object with a values array that holds
 two-dimensional array of rows with pixel values
 {
   values:
    [
      [55.874908, 57.874924, 58.874939, ...], // first row
      [62.875015, 63.875031, 62.875046, ...],
      [62.875122, 64.875137, 63.875168, ...],
      .
      .
      .
      [52.875671, 50.875702, 51.875717, ...], // last row
    ]
  }
*/
```

## Reading Pixel Values within Bounding Box
You can specify a bounding box to read from by specifying the zero-based index
values of the first and last row, and first and last column for each row
```javascript
const parseAsciiGridData = require("ascii-grid/parse-ascii-grid-data");

const result = await parseAsciiGridData({
  data: buffer,
  debug: true,
  start_column: 2, // start reading from the third column
  end_column: 10, // read through the eleventh column
  start_row: 1, // skip the first row
  end_row: undefined // read through the end
});

/*
 result's values array is the size of the bbox.
 each row has a length of end_column - start_column + 1
 {
   values:
    [
      [62.875046, ...], // first row starting with index of start_row
      [63.875168, ...],
      .
      .
      .
      [51.875717, ...], // last row
    ]
  }
*/
```