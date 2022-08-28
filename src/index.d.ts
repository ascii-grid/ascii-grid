type Meta = {
  ncols: number;
  nrows: number;
  xllcenter: number;
  yllcenter: number;
  cellsize: number;
  nodata_value: number;
  last_metadata_line: number;
  last_metadata_byte: number;
}

type RawMeta = {
  ncols: string;
  nrows: string;
  xllcenter: string;
  yllcenter: string;
  cellsize: string;
  nodata_value: string;
  last_metadata_line: number;
  last_metadata_byte: number;
}

export function isAsciiGrid(arg:
  {
    data: ArrayBuffer | Buffer | DataView | Uint8Array | string | Promise<ArrayBuffer> | Promise<Buffer> | Promise<DataView> | Promise<Uint8Array> | Promise<string>;
    debug?: boolean;
    max_read_length?: number;
  }
): Promise<boolean>;

export function parseAsciiGridData<check_fixed_digits extends boolean, flat extends boolean = false>(arg: {
  assume_clean?: boolean;
  cache?: boolean;
  debug_level?: number;
  data?: string | ArrayBuffer | Uint8Array | DataView | any,
  max_read_length?: number;
  start_of_data_byte?: number;
  start_column?: number;
  end_column?: number;
  start_row?: number;
  end_row?: number;
  meta?: Meta | RawMeta,
  flat?: flat;
  check_fixed_digits?: check_fixed_digits;
}): check_fixed_digits extends true ? { fixed_digits: number, values: flat extends true ? number[] : number[][] } : { values: flat extends true ? number[] : number[][] };

export function parseAsciiGridMeta<R extends boolean>(arg:
  {
    cache?: boolean;
    data?: ArrayBuffer | Buffer | String;
    debug_level?: number;
    max_read_length?: number;
    raw?: R;
  }
): R extends true ? RawMeta : Meta;

export function calcAsciiGridStats(arg: {
  assume_clean?: boolean;
  debug_level?: number;
  data: ArrayBuffer | Buffer | string;
  max_read_length?: number;
  start_of_data_byte?: number;
  start_column?: number;
  end_column?: number;
  start_row?: number;
  end_row?: number;
  meta?: Meta | RawMeta
}):  { [key: string]: any }

export function iterAsciiGridPoint(arg: {
  assume_clean?: boolean;
  cache?: boolean;
  debug_level?: number;
  data: ArrayBuffer | Buffer | string;
  max_read_length?: number;
  start_of_data_byte?: number;
  start_column?: number;
  end_column?: number;
  start_row?: number;
  end_row?: number;
  meta?: Meta | RawMeta;
}): any;

export function forEachAsciiGridPoint(arg: Parameters<typeof iterAsciiGridPoint>[0] & {
  callback: (data: { c: number, r: number, num: number, str: string, meta: Meta | RawMeta }) => void;
}): void

export function writeAsciiGrid(arg: {
  data: any,
  ncols?: number | string;
  nrows?: number | string;
  xllcenter?: number | string,
  xllcorner?: number | string,
  yllcenter?: number | string,
  yllcorner?: number | string,
  cellsize: number | string,
  nodata_value?: number | string,
  strict?: boolean,
  debug_level?: number,
  trailing_newline?: boolean,
  fixed_digits?: number
}): { asc: string };
