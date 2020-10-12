const fs = require('fs');
const argv = require('argv');
const PDFDocument = require('pdfkit');
const url = require('url');

//https://meta01.library.pref.nara.jp/mmd/iiif/400/138734/582810.tiff/500,355,3069,2160/3069,2160/0/default.jpg
//https://meta01.library.pref.nara.jp/mmd/iiif/400/138734/582889.tiff/500,355,3069,2160/3069,2160/0/default.jpg

argv.type( 'url', function( value ) {
  const parsed = url.parse(value);
  console.log(parsed);
  if (!value || !parsed.protocol || !parsed.protocol.match(/^http/) ||
      !parsed.host || !parsed.path) throw('URL value must be valid http url.');
  if (!value.match(/\{n\}/)) throw('URL value must include placeholder "{n}".');
  return value;
});

const stringint = function(key, value) {
  if (!value || !value.match(/^\d+$/)) throw(`Argument ${key} must be integer value`);
  const number = parseInt(value);
  const length = value.length;
  return [value, length, number];
};

argv.type( 'start', function( value ) {
  return stringint('start', value);
});

argv.type( 'end', function( value ) {
  return stringint('end', value);
});

argv.type( 'size', function( value ) {
  const arr = size2array(value);
  if (!arr) throw('Size value must be valid size definition');
  return arr;
});

argv.option([
  {
    name: 'url',
    short: 'u',
    type : 'url',
    description :'URL template of jpg files. Put placeholder of numbers as "{n}."',
    example: "'node jpg2pdf.js --url=\"http://example.com/{n}.jpg\"' or 'node jpg2pdf.js -u \"http://example.com/{n}.jpg\"'"
  },
  {
    name: 'start',
    short: 's',
    type : 'start',
    description :'Start number of url place holder.',
    example: "'node jpg2pdf.js --start=0001' or 'node jpg2pdf.js -s 0001'"
  },
  {
    name: 'end',
    short: 'e',
    type : 'end',
    description :'End number of url place holder.',
    example: "'node jpg2pdf.js --start=0100' or 'node jpg2pdf.js -e 0100'"
  },
  {
    name: 'size',
    short: 'z',
    type : 'size',
    description :'Specify pdf size. If not specified or invalid case, using "LETTER" size.',
    example: "'node jpg2pdf.js --size=A4' or 'node jpg2pdf.js -z A4'"
  },
  {
    name: 'out',
    short: 'o',
    type : 'path',
    description :'Specify output file name. If not specified, using "./output.pdf".',
    example: "'node jpg2pdf.js --out=special.pdf' or 'node jpg2pdf.js -o special.pdf'"
  }
]);

const args = argv.run().options;
console.log(args);
const err = ['url', 'start', 'end'].reduce((prev, curr) => {
  return !args[curr] ? curr : prev;
}, null);
if (err) throw(`Argument ${err} is mandatory.`);
const template = args.url;
const start_str = args.start[0];
const start_len = args.start[1];
const start_num = args.start[2];
const end_str = args.end[0];
const end_len = args.end[1];
const end_num = args.end[2];
const size_arr = args.size;
const out = args.out || './output.pdf';

if (end_num <= start_num) throw('Start value must be smaller than end value.');
const fullnumber = end_num - start_num + 1;
const prevzero = Array.from(Array(start_len).keys()).map(x=>'0').join('');
const tasks = Array.from(Array(fullnumber).keys()).map((x) => {
  let ret;
  const tempnum = `${x + start_num}`;
  if (tempnum.length >= start_len) ret = tempnum;
  else ret = `${prevzero}${tempnum}`.slice(-1 * start_len);
  const url = template.replace('{n}', ret);
  const tmpfile = `./${ret}.jpg`;
  return [url, tmpfile];
});
console.log(tasks);

throw('hoge');

const size = 'A4';
const arrSize = size2array(size);

// Create a document
const doc = new PDFDocument(
  {
    autoFirstPage: false
  }
);

// Pipe its output somewhere, like to a file or HTTP response
// See below for browser usage
doc.pipe(fs.createWriteStream('output.pdf'));

// Add another page
const page = doc.addPage(
  {
    layout: 'landscape',
    size: arrSize
  }
);

//console.log(page);
//console.log(`${page.width} ${page.height}`);

// Add an image, constrain it to a given size, and center it vertically and horizontally
page.image('./582810.jpg', {
   //fit: [3069, 2160],
   align: 'center',
   valign: 'center'
});

// Add another page
doc.addPage(
  {
    layout: 'landscape',
    size: arrSize
  }
);

// Add an image, constrain it to a given size, and center it vertically and horizontally
doc.image('./582889.jpg', {
   //fit: [3069, 2160],
   align: 'center',
   valign: 'center'
});

// Finalize PDF file
doc.end();

function size2array(size) {
  if (Array.isArray(size)) return size;
  const key = size.toUpperCase();
  const SIZES = {
    '4A0': [4767.87, 6740.79],
    '2A0': [3370.39, 4767.87],
    A0: [2383.94, 3370.39],
    A1: [1683.78, 2383.94],
    A2: [1190.55, 1683.78],
    A3: [841.89, 1190.55],
    A4: [595.28, 841.89],
    A5: [419.53, 595.28],
    A6: [297.64, 419.53],
    A7: [209.76, 297.64],
    A8: [147.40, 209.76],
    A9: [104.88, 147.40],
    A10: [73.70, 104.88],
    B0: [2834.65, 4008.19],
    B1: [2004.09, 2834.65],
    B2: [1417.32, 2004.09],
    B3: [1000.63, 1417.32],
    B4: [708.66, 1000.63],
    B5: [498.90, 708.66],
    B6: [354.33, 498.90],
    B7: [249.45, 354.33],
    B8: [175.75, 249.45],
    B9: [124.72, 175.75],
    B10: [87.87, 124.72],
    C0: [2599.37, 3676.54],
    C1: [1836.85, 2599.37],
    C2: [1298.27, 1836.85],
    C3: [918.43, 1298.27],
    C4: [649.13, 918.43],
    C5: [459.21, 649.13],
    C6: [323.15, 459.21],
    C7: [229.61, 323.15],
    C8: [161.57, 229.61],
    C9: [113.39, 161.57],
    C10: [79.37, 113.39],
    RA0: [2437.80, 3458.27],
    RA1: [1729.13, 2437.80],
    RA2: [1218.90, 1729.13],
    RA3: [864.57, 1218.90],
    RA4: [609.45, 864.57],
    SRA0: [2551.18, 3628.35],
    SRA1: [1814.17, 2551.18],
    SRA2: [1275.59, 1814.17],
    SRA3: [907.09, 1275.59],
    SRA4: [637.80, 907.09],
    EXECUTIVE: [521.86, 756.00],
    FOLIO: [612.00, 936.00],
    LEGAL: [612.00, 1008.00],
    LETTER: [612.00, 792.00],
    TABLOID: [792.00, 1224.00]
  };
  return SIZES[key] || SIZES['LETTER'];
}
