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
  
  // Find imports from lucide-react
  const importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
  if (importMatch) {
    const icons = importMatch[1].split(',').map(i => i.trim().split(' as ')[0]).filter(i => i);
    
    let newContent = content;
    for (const icon of icons) {
      // Add strokeWidth={1} if it doesn't exist
      const regex = new RegExp(`<${icon}(\\s+)(?!.*?strokeWidth)`, 'g');
      newContent = newContent.replace(regex, `<${icon}$1strokeWidth={1} `);
      
      // Also update existing strokeWidth to {1}
      const regexReplace = new RegExp(`<${icon}(.*?\\s)strokeWidth={[^}]+}(.*?)>`, 'g');
      newContent = newContent.replace(regexReplace, `<${icon}$1strokeWidth={1}$2>`);
      
      const regexReplaceStr = new RegExp(`<${icon}(.*?\\s)strokeWidth="[^"]+"(.*?)>`, 'g');
      newContent = newContent.replace(regexReplaceStr, `<${icon}$1strokeWidth={1}$2>`);
    }
    
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf-8');
      console.log(`Updated icons in ${file}`);
    }
  }
}
