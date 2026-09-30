const fs = require('fs');
let content = fs.readFileSync('lib/beneficiary-rails.ts', 'utf8');
content = content.replace(/\\\`/g, '\`');
content = content.replace(/\\\$/g, '$');
fs.writeFileSync('lib/beneficiary-rails.ts', content);
