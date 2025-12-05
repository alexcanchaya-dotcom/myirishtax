import fs from 'fs';
import path from 'path';

const cssSrc = path.resolve('src/styles/main.css');
const cssDest = path.resolve('public/assets/css/main.min.css');
const jsSrc = path.resolve('src/assets/main.js');
const jsDest = path.resolve('public/assets/js/main.min.js');
const calculatorSrc = path.resolve('src/assets/calculator.js');
const calculatorDest = path.resolve('public/assets/js/calculator.js');

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
  const js = fs.readFileSync(jsSrc, 'utf-8');
  ensureDir(jsDest);
  fs.writeFileSync(jsDest, minify(js));
  console.log('JS minified to', jsDest);
}

function copyCalculator() {
  const js = fs.readFileSync(calculatorSrc, 'utf-8');
  ensureDir(calculatorDest);
  fs.writeFileSync(calculatorDest, minify(js));
  console.log('Calculator exported to', calculatorDest);
}

buildCSS();
buildJS();
copyCalculator();
