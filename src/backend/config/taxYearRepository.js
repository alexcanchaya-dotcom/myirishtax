import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { isTaxYearEnabled, getEnabledTaxYears } from './featureToggles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TAX_YEAR_DIR = path.resolve(__dirname, '../../../config/tax_years');

const cache = new Map();

function validateConfigShape(config, year) {
  if (!config?.metadata?.year) throw new Error(`Tax config ${year} missing metadata.year`);
  if (!config.income_tax || !config.usc || !config.prsi || !config.bik) {
    throw new Error(`Tax config ${year} missing required sections`);
  }
}

export async function listAvailableTaxYears() {
  const files = await fs.readdir(TAX_YEAR_DIR);
  const years = files
    .filter((file) => file.endsWith('.yml'))
    .map((file) => path.basename(file, '.yml'))
    .sort();

  const enabledYears = getEnabledTaxYears();
  return years
    .map((year) => ({
      year,
      enabled: enabledYears ? enabledYears.includes(year) : true
    }))
    .filter((entry) => entry.enabled);
}

export async function loadTaxYearConfig(year) {
  if (!isTaxYearEnabled(year)) {
    throw new Error(`Tax year ${year} is disabled by configuration`);
  }
  if (cache.has(year)) return cache.get(year);

  const filePath = path.resolve(TAX_YEAR_DIR, `${year}.yml`);
  let fileContents;
  try {
    fileContents = await fs.readFile(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Unable to read tax config for ${year}: ${err.message}`);
  }

  const config = yaml.load(fileContents);
  validateConfigShape(config, year);
  cache.set(year, config);
  return config;
}
