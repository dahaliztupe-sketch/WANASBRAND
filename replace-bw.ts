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
  let content = fs.readFileSync(file, 'utf-8');
  let newContent = content
    .replace(/bg-white/g, 'bg-primary')
    .replace(/bg-black/g, 'bg-inverted')
    .replace(/text-white/g, 'text-inverted')
    .replace(/text-black/g, 'text-primary')
    .replace(/border-white/g, 'border-primary')
    .replace(/border-black/g, 'border-primary')
    .replace(/ring-white/g, 'ring-primary')
    .replace(/ring-black/g, 'ring-primary');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
