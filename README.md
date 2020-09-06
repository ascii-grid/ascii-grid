:warning: Work in Progress.  This library is under active development and is not ready for production yet.

# ascii-grid
Identify and Read an ARC/INFO ASCII Grid

# usage
## identify ascii grid files
```javascript
const isAsciiGrid = require("ascii-grid/is-ascii-grid");

const buffer = readFileSync('./test_data/michigan_lld/michigan_lld.asc');
isAsciiGrid(buffer, { debug: false });
// true
```

## parse ascii grid metadata
```javascript
const parseAsciiGridMeta = require("ascii-grid/parse-ascii-grid-meta");

const buffer = readFileSync('./test_data/michigan_lld/michigan_lld.asc');
const metadata = parseAsciiGridMeta(buffer, { debug: false });
/*
{
  ncols: 4201,
  nrows: 5365,
  xllcenter: -88,
  yllcenter: 41.62,
  cellsize: 0.0008333333333,
  nodata_value: -9999
}
*/
```

## Reading Pixel Values
Coming Soon!
