// tools/generateComponentList.js
const fs = require('fs');
const path = require('path');

const folders = ['pages', 'views', 'screens'];
const baseDir = path.join(__dirname, '../src');
const outFile = path.join(baseDir, 'componentList.json');

let components = [];

folders.forEach(folder => {
  const folderPath = path.join(baseDir, folder);
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        components.push({
          name: path.basename(file, path.extname(file)),
          file,
          folder,
          importPath: `../${folder}/${file}`,
        });
      }
    });
  }
});

fs.writeFileSync(outFile, JSON.stringify(components, null, 2));
console.log(`✅ Component list written to ${outFile}`);
