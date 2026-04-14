import fs from 'fs';
import path from 'path';

const walkSync = (dir: string, filelist: string[] = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        filelist = walkSync(filepath, filelist);
      }
    } else if (filepath.endsWith('.tsx') || filepath.endsWith('.ts')) {
      filelist.push(filepath);
    }
  }
  return filelist;
};

const files = walkSync('./app').concat(walkSync('./components'));

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const newContent = content
    // Backgrounds
    .replace(/bg-pearl-white/g, 'bg-primary')
    .replace(/bg-charcoal-dark/g, 'bg-inverted')
    .replace(/bg-kashmiri-rose/g, 'bg-accent-primary')
    .replace(/bg-kashmiri-light/g, 'bg-secondary')
    .replace(/bg-espresso/g, 'bg-inverted')
    // Texts
    .replace(/text-pearl-white/g, 'text-inverted')
    .replace(/text-charcoal-dark/g, 'text-primary')
    .replace(/text-kashmiri-rose/g, 'text-accent-primary')
    .replace(/text-kashmiri-light/g, 'text-secondary')
    .replace(/text-espresso/g, 'text-primary')
    // Borders
    .replace(/border-pearl-white/g, 'border-primary')
    .replace(/border-charcoal-dark/g, 'border-primary')
    .replace(/border-kashmiri-rose/g, 'border-accent-primary')
    .replace(/border-kashmiri-light/g, 'border-primary')
    .replace(/border-espresso/g, 'border-primary')
    // Rings
    .replace(/ring-pearl-white/g, 'ring-primary')
    .replace(/ring-charcoal-dark/g, 'ring-primary')
    .replace(/ring-kashmiri-rose/g, 'ring-accent-primary')
    .replace(/ring-kashmiri-light/g, 'ring-primary')
    // Fills & Strokes
    .replace(/fill-pearl-white/g, 'fill-primary')
    .replace(/fill-charcoal-dark/g, 'fill-inverted')
    .replace(/fill-kashmiri-rose/g, 'fill-accent-primary')
    .replace(/stroke-pearl-white/g, 'stroke-primary')
    .replace(/stroke-charcoal-dark/g, 'stroke-inverted')
    .replace(/stroke-kashmiri-rose/g, 'stroke-accent-primary')
    // Gradients
    .replace(/from-pearl-white/g, 'from-primary')
    .replace(/to-pearl-white/g, 'to-primary')
    .replace(/via-pearl-white/g, 'via-primary')
    .replace(/from-charcoal-dark/g, 'from-inverted')
    .replace(/to-charcoal-dark/g, 'to-inverted')
    .replace(/via-charcoal-dark/g, 'via-inverted');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
