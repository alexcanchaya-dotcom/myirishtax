import fs from 'fs';
import path from 'path';

const cssSrc = path.resolve('src/styles/main.css');
const cssDest = path.resolve('public/assets/css/main.min.css');

const jsEntries = [
  { src: path.resolve('src/assets/main.js'), dest: path.resolve('public/assets/js/main.min.js') },
  { src: path.resolve('src/assets/calculator.js'), dest: path.resolve('public/assets/js/calculator.js') },
  { src: path.resolve('src/assets/tracking.js'), dest: path.resolve('public/assets/js/tracking.js') }
];

function minify(content) {
  return content
    .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([:;{}(),])\s*/g, '$1')
    .trim();
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function buildCSS() {
  const css = fs.readFileSync(cssSrc, 'utf-8');
  ensureDir(cssDest);
  fs.writeFileSync(cssDest, minify(css));
  console.log('CSS minified to', cssDest);
}

function buildJS() {
  jsEntries.forEach(({ src, dest }) => {
    const js = fs.readFileSync(src, 'utf-8');
    ensureDir(dest);
    fs.writeFileSync(dest, minify(js));
    console.log('JS processed to', dest);
  });
}

buildCSS();
buildJS();
