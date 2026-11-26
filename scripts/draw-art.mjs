// Original pixel art. Run "node scripts/draw-art.mjs" to redraw the small PNG atlases.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const out = new URL('../public/art/', import.meta.url);
mkdirSync(out, { recursive: true });

function canvas(width, height) {
  const data = Buffer.alloc(width * height * 4);
  const colours = new Map();
  function rgba(hex) {
    if (!colours.has(hex)) {
      const n = parseInt(hex, 16);
      colours.set(hex, [n >> 16, (n >> 8) & 255, n & 255, 255]);
    }
    return colours.get(hex);
  }
  function rect(x, y, w, h, hex) {
    const color = rgba(hex);
    for (let j = Math.max(0, y); j < Math.min(height, y + h); j++)
      for (let i = Math.max(0, x); i < Math.min(width, x + w); i++) data.set(color, (j * width + i) * 4);
  }
  function poly(points, hex) {
    const ys = points.map((p) => p[1]);
    for (let y = Math.max(0, Math.min(...ys)); y < Math.min(height, Math.max(...ys)); y++) {
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const [a, b] = points[i],
          [c, d] = points[(i + 1) % points.length];
        if ((b <= y + 0.5 && y + 0.5 < d) || (d <= y + 0.5 && y + 0.5 < b))
          xs.push(a + ((c - a) * (y + 0.5 - b)) / (d - b));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2)
        rect(Math.ceil(xs[i]), y, Math.ceil(xs[i + 1]) - Math.ceil(xs[i]), 1, hex);
    }
  }
  function save(name) {
    const crc = (buf) => {
      let n = 0xffffffff;
      for (const byte of buf) {
        n ^= byte;
        for (let i = 0; i < 8; i++) n = (n >>> 1) ^ (n & 1 ? 0xedb88320 : 0);
      }
      return (n ^ 0xffffffff) >>> 0;
    };
    const chunk = (type, payload) => {
      const id = Buffer.from(type),
        len = Buffer.alloc(4),
        sum = Buffer.alloc(4);
      len.writeUInt32BE(payload.length);
      sum.writeUInt32BE(crc(Buffer.concat([id, payload])));
      return Buffer.concat([len, id, payload, sum]);
    };
    const info = Buffer.alloc(13);
    info.writeUInt32BE(width);
    info.writeUInt32BE(height, 4);
    info[8] = 8;
    info[9] = 6;
    const raw = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y++)
      data.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
    writeFileSync(
      new URL(name, out),
      Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk('IHDR', info),
        chunk('IDAT', deflateSync(raw)),
        chunk('IEND', Buffer.alloc(0)),
      ]),
    );
  }
  return { rect, poly, save };
}

const ink = '263747';
const suits = [
  ['dc4844', '942f3b', 'ff7970'],
  ['9968c2', '604788', 'c693e5'],
  ['50afa8', '2f757e', '88d6c4'],
  ['538dc3', '355c8d', '8ab7da'],
  ['ed9652', 'af6140', 'ffc67c'],
  ['dfaf45', '9e7234', 'ffe387'],
  ['639669', '426b58', 'a0c68b'],
  ['df829c', 'a95577', 'fbb3c3'],
  ['6f91b9', '495d85', '9bbfdf'],
  ['a87855', '754d43', 'd6a47b'],
  ['e67b46', 'ac5241', 'ffad69'],
  ['a6a4cc', '706d98', 'd7cde9'],
  ['ce5453', '94363e', 'f58c79'],
  ['899d9d', '5d7380', 'b5c6be'],
];
const atlas = canvas(28 * suits.length, 32);
const hats = [
  ['  gg   ', ' gGGg g', '  gGggG', '   gg  ', '   g   '],
  ['y  y  y', 'YYyYyYY', ' yYYYY ', ' yyyyy '],
  ['  www ', ' wWWww', ' wWkwW', '  wwwW', '    wW'],
  ['  bbbb   ', ' bBBBBb  ', ' bBBBBbbb', ' bbbbbbbb'],
  [' www www ', 'wWWWwWWWw', ' wWWWWWw ', '  wwwww  ', '  wWWWw  '],
  [' ddddddd ', 'dRRRRRRRd', '   dd  dd'],
  ['   gg   ', '  gGGg  ', ' gGGGGg ', ' dgggggd'],
  ['   rr', '   rR', '   dd', '   d ', '   d '],
  ['  yyyy  ', ' yYyyYy ', 'yYYyyYYy', 'yyyyyyyy'],
  ['    d ', '  dddd', ' ddddd', 'dddddd'],
  ['  rr  ', ' rRr  ', ' rRrRr', '  rrr '],
  ['  www  ', ' wWWWw ', ' wwwww ', '   dd  '],
  [],
  [],
];
const hp = {
  g: '446b49',
  G: '96c96b',
  y: '996b34',
  Y: 'ffcf62',
  w: '718580',
  W: 'f5f1d4',
  k: ink,
  b: '344966',
  B: '6785a9',
  r: '923c42',
  R: 'e66757',
  d: ink,
};
suits.forEach(([main, shade, shine], i) => {
  const x = i * 28,
    r = (a, b, w, h, c) => atlas.rect(x + a, b, w, h, c),
    p = (xy, c) =>
      atlas.poly(
        xy.map(([a, b]) => [x + a, b]),
        c,
      );
  p(
    [
      [2, 16],
      [4, 14],
      [8, 14],
      [9, 16],
      [9, 25],
      [7, 27],
      [3, 27],
      [1, 25],
      [1, 18],
    ],
    ink,
  );
  r(3, 17, 4, 8, shade);
  r(4, 16, 3, 3, main);
  p(
    [
      [6, 12],
      [8, 12],
      [8, 10],
      [11, 8],
      [18, 8],
      [21, 9],
      [23, 12],
      [24, 16],
      [23, 23],
      [22, 25],
      [22, 29],
      [20, 31],
      [16, 31],
      [15, 29],
      [15, 26],
      [13, 26],
      [13, 29],
      [11, 31],
      [7, 31],
      [5, 29],
      [5, 21],
    ],
    ink,
  );
  p(
    [
      [7, 13],
      [10, 11],
      [11, 10],
      [18, 10],
      [21, 12],
      [22, 17],
      [21, 23],
      [20, 25],
      [20, 28],
      [17, 29],
      [17, 24],
      [11, 24],
      [11, 28],
      [7, 29],
      [7, 23],
    ],
    shade,
  );
  p(
    [
      [7, 14],
      [10, 11],
      [12, 10],
      [18, 10],
      [20, 12],
      [21, 16],
      [20, 20],
      [17, 23],
      [11, 24],
      [8, 21],
    ],
    main,
  );
  r(10, 11, 5, 1, shine);
  r(8, 13, 2, 3, shine);
  r(7, 27, 3, 1, main);
  p(
    [
      [12, 14],
      [14, 12],
      [21, 11],
      [24, 12],
      [26, 14],
      [26, 17],
      [24, 20],
      [17, 20],
      [13, 19],
      [11, 17],
    ],
    ink,
  );
  p(
    [
      [13, 15],
      [15, 14],
      [21, 13],
      [24, 14],
      [24, 16],
      [22, 18],
      [16, 18],
      [13, 17],
    ],
    '69b0c6',
  );
  r(15, 14, 8, 2, 'c3e8e4');
  r(17, 13, 5, 2, 'f6ffef');
  r(22, 17, 2, 1, '45819a');
  const hat = hats[i];
  hat.forEach((line, dy) =>
    [...line].forEach((c, dx) => {
      if (hp[c]) r(10 + dx, 10 - hat.length + dy, 1, 1, hp[c]);
    }),
  );
});
atlas.save('crew.png');

const room = canvas(384, 184),
  { rect: r, poly: p } = room;
r(0, 0, 384, 184, 'c6d2cb');
for (let y = 20; y < 184; y += 17)
  for (let x = -16; x < 384; x += 22) {
    const dx = x + (((y - 20) / 17) % 2) * 11;
    r(dx, y, 21, 16, (Math.floor(x / 22) + Math.floor(y / 17)) % 3 ? 'cbd6cc' : 'c4d1c9');
    r(dx, y, 21, 1, 'd7dfd3');
    r(dx, y + 16, 22, 1, 'b5c5bf');
    r(dx + 21, y, 1, 17, 'b5c5bf');
  }
const plate = (x, y, w, h, c) =>
  p(
    [
      [x + 5, y],
      [x + w - 5, y],
      [x + w, y + 5],
      [x + w, y + h - 5],
      [x + w - 5, y + h],
      [x + 5, y + h],
      [x, y + h - 5],
      [x, y + 5],
    ],
    c,
  );
r(0, 0, 384, 26, '567174');
r(0, 1, 384, 3, 'dce4d7');
r(0, 5, 384, 14, 'a4b9b3');
for (let x = 4; x < 384; x += 32) {
  r(x, 5, 2, 13, '899f99');
  r(x + 2, 5, 1, 13, 'c0cec1');
  r(x + 9, 7, 2, 2, '768e89');
}
r(0, 20, 384, 2, 'd4ddcf');
r(0, 23, 384, 2, '859b96');
r(0, 26, 384, 4, 'b4c4bc');
for (const x of [37, 145, 251]) {
  plate(x, 2, 76, 19, '587173');
  plate(x + 2, 3, 72, 16, 'c9d6c9');
  plate(x + 5, 5, 66, 11, '324958');
  r(x + 8, 6, 60, 7, '405d70');
  r(x + 8, 6, 21, 1, '829fa7');
  r(x + 42, 8, 1, 1, 'e6e1be');
  r(x + 54, 10, 2, 1, 'aac9c9');
  r(x + 33, 5, 3, 11, '9eafa5');
  r(x + 33, 5, 1, 10, 'dbe2ce');
}
function vent(x, y) {
  plate(x, y, 23, 12, '839b96');
  plate(x + 1, y + 1, 21, 9, 'b2c0b7');
  for (let j = 0; j < 3; j++) {
    r(x + 4, y + 3 + j * 2, 15, 1, '647f80');
  }
  r(x + 2, y + 2, 1, 1, 'e8e8cd');
}
vent(12, 38);
vent(348, 147);
function table(x, y, w, h, small) {
  const oct = (dx, dy, ww, hh, c) =>
    p(
      [
        [dx + ww * 0.2, dy],
        [dx + ww * 0.8, dy],
        [dx + ww, dy + hh * 0.31],
        [dx + ww, dy + hh * 0.68],
        [dx + ww * 0.8, dy + hh],
        [dx + ww * 0.2, dy + hh],
        [dx, dy + hh * 0.68],
        [dx, dy + hh * 0.31],
      ].map(([a, b]) => [Math.round(a), Math.round(b)]),
      c,
    );
  oct(x + 3, y + 8, w, h, '9daea9');
  oct(x, y + 4, w, h, '38566a');
  oct(x, y, w, h, '354f65');
  oct(x + 2, y + 1, w - 4, h - 3, '6c9bad');
  oct(x + 4, y + 2, w - 8, h - 7, '83afbb');
  r(x + Math.floor(w * 0.22), y + 2, Math.floor(w * 0.56), 1, 'c6ded7');
  if (small) {
    r(x + Math.floor(w * 0.4), y + Math.floor(h * 0.4), 8, 5, '607f8d');
    r(x + Math.floor(w * 0.4) + 1, y + Math.floor(h * 0.4) - 1, 7, 4, 'd9d8b8');
  }
}
table(-27, 83, 62, 37, true);
table(347, 65, 62, 37, true);
table(143, 70, 98, 49, false);
plate(173, 83, 37, 19, '486b7c');
plate(173, 81, 37, 18, '334553');
r(176, 83, 31, 12, 'e8c96b');
for (let k = 0; k < 4; k++) {
  p(
    [
      [175 + k * 8, 83],
      [179 + k * 8, 83],
      [175 + k * 8, 88],
      [174 + k * 8, 88],
    ],
    '414954',
  );
}
r(180, 85, 23, 9, '344955');
r(182, 85, 19, 7, '829a9a');
plate(185, 82, 14, 10, '802e3c');
plate(185, 80, 14, 8, 'cf4c4b');
r(188, 81, 7, 2, 'ff927a');
r(187, 87, 10, 1, 'a03642');
const glyphs = {
  E: ['111', '100', '110', '100', '111'],
  M: ['101', '111', '111', '101', '101'],
  R: ['110', '101', '110', '101', '101'],
  G: ['111', '100', '101', '101', '111'],
  N: ['101', '111', '111', '111', '101'],
  C: ['111', '100', '100', '100', '111'],
  Y: ['101', '101', '010', '010', '010'],
};
[...'EMERGENCY'].forEach((v, i) =>
  glyphs[v].forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === '1') r(174 + 4 * i + x, 101 + y, 1, 1, 'd5e1d7');
    }),
  ),
);
for (const [x, y] of [
  [47, 119],
  [330, 47],
  [97, 155],
  [275, 150],
  [118, 56],
  [260, 115],
]) {
  r(x, y, 3, 1, '9cafab');
  r(x + 1, y - 1, 1, 3, '9cafab');
}
r(0, 174, 384, 1, '9aada4');
r(0, 176, 384, 4, 'afc0b6');
r(0, 180, 384, 4, '8da29b');
for (let x = 6; x < 384; x += 44) {
  r(x, 180, 2, 2, '677f7b');
}
room.save('cafeteria.png');

const icons = [
  ['0011100', '0111110', '1111111', '1100011', '1101011', '1101011', '1111111'],
  ['0110010', '1111111', '0110010', '0000000', '1110011', '1111111', '1111111'],
  ['0111110', '0111110', '1111111', '0000000', '1111111', '1010101', '1111111'],
  ['0111110', '1100011', '1101111', '1100011', '1101111', '1100011', '0111110'],
  ['0011100', '0111110', '1110011', '1100111', '1100101', '0001000', '0001000'],
  ['1010000', '1111000', '1111100', '1111000', '1010000', '1000000', '1000000'],
  ['0011100', '0111110', '1111111', '1111111', '0111110', '0011100', '0000000'],
  ['0000001', '0000011', '1000110', '1101100', '0111000', '0010000', '0000000'],
  ['1111111', '1100011', '1000001', '1111111', '1000101', '1100011', '1111111'],
];
const iconsArt = canvas(icons.length * 8, 8);
icons.forEach((rows, i) =>
  rows.forEach((row, y) =>
    [...row].forEach((v, x) => {
      if (v === '1') iconsArt.rect(i * 8 + x, y, 1, 1, 'ffffff');
    }),
  ),
);
iconsArt.save('icons.png');

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
const glyphs5 = [
  '01110/10001/10001/11111/10001/10001/10001',
  '11110/10001/10001/11110/10001/10001/11110',
  '01111/10000/10000/10000/10000/10000/01111',
  '11110/10001/10001/10001/10001/10001/11110',
  '11111/10000/10000/11110/10000/10000/11111',
  '11111/10000/10000/11110/10000/10000/10000',
  '01111/10000/10000/10111/10001/10001/01111',
  '10001/10001/10001/11111/10001/10001/10001',
  '11111/00100/00100/00100/00100/00100/11111',
  '00111/00010/00010/00010/00010/10010/01100',
  '10001/10010/10100/11000/10100/10010/10001',
  '10000/10000/10000/10000/10000/10000/11111',
  '10001/11011/10101/10101/10001/10001/10001',
  '10001/11001/11001/10101/10011/10011/10001',
  '01110/10001/10001/10001/10001/10001/01110',
  '11110/10001/10001/11110/10000/10000/10000',
  '01110/10001/10001/10001/10101/10010/01101',
  '11110/10001/10001/11110/10100/10010/10001',
  '01111/10000/10000/01110/00001/00001/11110',
  '11111/00100/00100/00100/00100/00100/00100',
  '10001/10001/10001/10001/10001/10001/01110',
  '10001/10001/10001/10001/01010/01010/00100',
  '10001/10001/10001/10101/10101/11011/10001',
  '10001/10001/01010/00100/01010/10001/10001',
  '10001/10001/01010/00100/00100/00100/00100',
  '11111/00001/00010/00100/01000/10000/11111',
  '01110/10001/10011/10101/11001/10001/01110',
  '00100/01100/00100/00100/00100/00100/01110',
  '01110/10001/00001/00010/00100/01000/11111',
  '11110/00001/00001/01110/00001/00001/11110',
  '00010/00110/01010/10010/11111/00010/00010',
  '11111/10000/10000/11110/00001/00001/11110',
  '01110/10000/10000/11110/10001/10001/01110',
  '11111/00001/00010/00100/01000/01000/01000',
  '01110/10001/10001/01110/10001/10001/01110',
  '01110/10001/10001/01111/00001/00001/01110',
  '00000/00000/00000/11111/00000/00000/00000',
];
const lettering = canvas(characters.length * 6, 7);
glyphs5.forEach((g, i) =>
  g.split('/').forEach((row, y) =>
    [...row].forEach((v, x) => {
      if (v === '1') lettering.rect(i * 6 + x, y, 1, 1, ink);
    }),
  ),
);
lettering.save('letters.png');
