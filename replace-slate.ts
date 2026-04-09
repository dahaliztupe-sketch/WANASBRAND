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
    .replace(/bg-slate-900/g, 'bg-inverted')
    .replace(/bg-slate-800/g, 'bg-inverted/90')
    .replace(/bg-slate-400/g, 'bg-secondary')
    .replace(/bg-slate-200/g, 'bg-primary')
    .replace(/bg-slate-100/g, 'bg-primary')
    .replace(/bg-slate-50/g, 'bg-primary')
    .replace(/text-slate-900/g, 'text-primary')
    .replace(/text-slate-800/g, 'text-primary')
    .replace(/text-slate-400/g, 'text-secondary')
    .replace(/text-slate-200/g, 'text-secondary')
    .replace(/border-slate-900/g, 'border-primary')
    .replace(/border-slate-800/g, 'border-primary')
    .replace(/border-slate-400/g, 'border-primary')
    .replace(/border-slate-200/g, 'border-primary/50')
    .replace(/ring-slate-900/g, 'ring-primary')
    .replace(/ring-slate-400/g, 'ring-primary');

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`Updated ${file}`);
  }
}
