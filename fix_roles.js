const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('c:\\Users\\Handicap\\Documents\\jph\\app\\(admin)\\admin\\(dashboard)\\customers', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    // Replace where: { role: 'USER', status: ... } with where: { status: ... }
    content = content.replace(/\{\s*role:\s*'USER',\s*/g, '{ ');
    // Replace where: { role: 'USER' } with where: {}
    content = content.replace(/\{\s*role:\s*'USER'\s*\}/g, '{}');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
