# ascii-grid: beta
> Identify and Read an ARC/INFO ASCII Grid

# motivation
I do a lot of client-side geoprocessing (see [geoblaze](http://github.com/geotiff/geoblaze)) and wanted to add support for .asc files.
When I encountered large .asc files, I quickly ran out of memory because I was trying to load the whole file into memory.
This package was created to make it easy to read specific areas of an ASCII Grid in a memory-safe way and prevent my laptop from overheating.

# install
```bash
npm install ascii-grid
```

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

## Reading Pixel Values into a Flat Array
Sometimes you may require the data to be returned in a one-dimensional flat array
instead of split up into rows.  To do so, set flat to true like below
```javascript
const parseAsciiGridData = require("ascii-grid/parse-ascii-grid-data");

const result = await parseAsciiGridData({
  data: buffer,
  flat: true
});

/*
 result's values array is as long as width * height
 {
   values: [55.874908, 57.874924, 58.874939, ...]
  }
*/
```

## Streaming Grid Points
If you don't want to save a large array of all the grid points,
but rather iterate over the points with a callback, see below:
```javascript
const forEachAsciiGridPoint = require("ascii-grid/for-each-ascii-grid-point");

forEachAsciiGridPoint({
  data: buffer,
  callback: ({ c, r, num }) => {
    console.log("row index is", r);
    console.log("column index is", c);
    console.log("value is", num);
  }
});
```

## Calculating Statistics
If you'd like to calculate statistics for the grid points:
```javascript
const calcAsciiGridStats = require("ascii-grid/calc-ascii-grid-stats");

const results = calcAsciiGridStats({
  // most important arguments
  data,
  calcHistogram = true,
  calcMinimum = true,
  calcMaximum = true,
  calcMean = true,
  calcMedian = true,
  calcMode = true

  // other arguments
  assume_clean = true,
  debug_level = 0,
  max_read_length = Infinity,
  start_of_data_byte,
  start_column = 0,
  end_column, // index of last column (using zero-based index)
  start_row = 0,
  end_row, // index of last row (using zero-based index)
  meta,
+}) 

/*
  results is an object
  {
    mean: 13.685328213781924,
    minimum: -275.890015,
    maximum: 351.943481,
    mode: 6.894897,
    histogram: {
      '15.938934': { num: 15.938934, ct: 5 },
      '18.938965': { num: 18.938965, ct: 3 },
      .
      .
      .
      '19.939148': { num: 19.939148, ct: 3 }
    }
  }
*/

```
