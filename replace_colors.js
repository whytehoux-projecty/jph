const fs = require('fs');
const path = require('path');

const dirs = [
  'app/(portal)',
  'app/(admin)',
  'components'
];

const replacements = [
  { pattern: /\[color:var\(--heritage-navy\)\]/g, replacement: 'ink-900' },
  { pattern: /\[color:var\(--heritage-surface\)\]/g, replacement: 'paper-100' },
  { pattern: /\[color:var\(--heritage-gold\)\]/g, replacement: 'vermilion-600' },
  { pattern: /\[color:var\(--vintage-green\)\]/g, replacement: 'pine-700' },
  { pattern: /\[color:var\(--soft-gold\)\]/g, replacement: 'vermilion-600' },
  
  { pattern: /heritage-navy-mid/g, replacement: 'ink-700' },
  { pattern: /heritage-navy-light/g, replacement: 'ink-700' },
  { pattern: /heritage-navy-dark/g, replacement: 'ink-900' },
  { pattern: /heritage-navy/g, replacement: 'ink-900' },
  
  { pattern: /vintage-green-light/g, replacement: 'pine-600' },
  { pattern: /vintage-green-dark/g, replacement: 'pine-800' },
  { pattern: /vintage-green/g, replacement: 'pine-700' },
  
  { pattern: /soft-gold-light/g, replacement: 'vermilion-400' },
  { pattern: /soft-gold-dark/g, replacement: 'vermilion-700' },
  { pattern: /soft-gold/g, replacement: 'vermilion-600' },
  
  { pattern: /heritage-surface/g, replacement: 'paper-100' },
  
  { pattern: /charcoal-light/g, replacement: 'ink-500' },
  { pattern: /charcoal-lighter/g, replacement: 'ink-500' },
  { pattern: /charcoal/g, replacement: 'ink-900' },
  
  { pattern: /faded-gray-light/g, replacement: 'paper-300' },
  { pattern: /faded-gray/g, replacement: 'paper-300' },
  
  { pattern: /warm-cream/g, replacement: 'paper-50' },
  { pattern: /off-white/g, replacement: 'paper-50' },
  { pattern: /parchment/g, replacement: 'paper-50' },
  
  { pattern: /font-playfair/g, replacement: 'font-display' },
  
  { pattern: /shadow-vintage-xl/g, replacement: 'shadow-xl' },
  { pattern: /shadow-vintage-lg/g, replacement: 'shadow-lg' },
  { pattern: /shadow-vintage-md/g, replacement: 'shadow-md' },
  { pattern: /shadow-vintage-sm/g, replacement: 'shadow-sm' },
  
  { pattern: /navy-glow/g, replacement: 'shadow-sm' }
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { pattern, replacement } of replacements) {
        if (pattern.test(content)) {
          content = content.replace(pattern, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

for (const dir of dirs) {
  processDirectory(path.join(__dirname, dir));
}
