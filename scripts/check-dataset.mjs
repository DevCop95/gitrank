// Fails the build when the committed dataset is missing or obviously broken,
// so a bad scraper run can never be published to GitHub Pages.
import { readFileSync } from 'node:fs';

const file = process.argv[2] || 'public/data/committers.json';
const MIN_COUNTRIES = 10;

function fail(message) {
  console.error(`Dataset check failed: ${message}`);
  process.exit(1);
}

let dataset;
try {
  dataset = JSON.parse(readFileSync(file, 'utf8'));
} catch (error) {
  fail(`cannot read ${file}: ${error.message}`);
}

const countries = dataset.countries;
if (!countries || typeof countries !== 'object') fail('missing "countries" object');
if (Number.isNaN(Date.parse(dataset.last_updated))) fail('"last_updated" is not a valid date');

const codes = Object.keys(countries);
if (codes.length < MIN_COUNTRIES) fail(`only ${codes.length} countries (expected at least ${MIN_COUNTRIES})`);
if (!countries.World) fail('missing "World" entry');

let developers = 0;
for (const code of codes) {
  const list = countries[code].top_developers;
  if (!Array.isArray(list)) fail(`${code}: "top_developers" is not a list`);
  for (const dev of list) {
    if (!dev.login || typeof dev.rank !== 'number') fail(`${code}: developer without login/rank`);
  }
  developers += list.length;
}
if (developers === 0) fail('no developers in dataset');

console.log(`Dataset OK: ${codes.length} countries, ${developers} developers, updated ${dataset.last_updated}`);
