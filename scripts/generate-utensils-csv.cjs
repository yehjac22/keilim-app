const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.join(process.cwd(), 'src/data/utensils.ts'), 'utf8');
const match = source.match(/export const UTENSILS:\s*Utensil\[\]\s*=\s*(\[[\s\S]*?\n\]);/);

if (!match) {
  throw new Error('Could not locate UTENSILS array');
}

const arrayCode = match[1]
  .replace(/\bY\b/g, '"yes"')
  .replace(/\bN\b/g, '"no"')
  .replace(/\bV\b/g, '"varies"');

const utensils = vm.runInNewContext(arrayCode);
const headers = ['id', 'name', 'category', 'tevila', 'brocha', 'notes', 'debates', 'tags', 'image_url'];

function escapeCsv(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

const lines = [headers.map(escapeCsv).join(',')];

for (const utensil of utensils) {
  lines.push(
    [
      utensil.id,
      utensil.name,
      utensil.category,
      utensil.tevila,
      utensil.brocha,
      utensil.notes || '',
      utensil.debates || '',
      Array.isArray(utensil.tags) ? utensil.tags.join(', ') : '',
      utensil.imageUrl || '',
    ]
      .map(escapeCsv)
      .join(',')
  );
}

const outputPath = path.join(process.cwd(), 'data/utensils-upload.csv');
fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote ${outputPath} with ${utensils.length} rows.`);
