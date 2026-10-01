const fs = require('fs');
const path = require('path');

const PRODUCT_SLUGS = [
    'checking',
    'savings',
    'credit-cards',
    'mortgages',
    'personal-loans',
    'auto-loans',
    'business-checking',
    'merchant-services',
    'treasury-management'
];

const dir = path.join(__dirname, 'src', 'content', 'products');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

PRODUCT_SLUGS.forEach(slug => {
    const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const content = `# ${title}\n\nWelcome to the {{BRAND.shortName}} ${title} page. Detailed information about our ${title} products will be published here shortly. For immediate assistance, please [Contact Us](/contact) at {{BRAND.phoneDisplay}}.`;
    fs.writeFileSync(path.join(dir, `${slug}.md`), content);
});

console.log('MDX files created successfully.');
