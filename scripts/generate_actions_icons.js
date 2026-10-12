const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.resolve(__dirname, '../public/images/dashboard/actions');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Stately, institutional private banking vector icons
// Stroke: #14181F (Ink)
// 100% Transparent Background

const icons = {
  'make-payment': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#14181F" stroke-linecap="round" stroke-linejoin="round">
  <!-- Top Right Arrow -->
  <path d="M13 22h35" stroke-width="4.5" />
  <path d="M37 12l13 10-13 10" stroke-width="4.5" />
  <!-- Bottom Left Arrow -->
  <path d="M51 42H16" stroke-width="4.5" />
  <path d="M27 32L14 42l13 10" stroke-width="4.5" />
</svg>`,

  'vaults-cards': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#14181F" stroke-linecap="round" stroke-linejoin="round">
  <!-- Outer Vault Body -->
  <rect x="9" y="10" width="46" height="42" rx="4" stroke-width="3.5" />
  <!-- Inner Recessed Door Frame -->
  <rect x="15" y="16" width="34" height="30" rx="2" stroke-width="2.5" />
  <!-- Corner Rivets -->
  <circle cx="19" cy="20" r="1.2" fill="#14181F" stroke="none" />
  <circle cx="45" cy="20" r="1.2" fill="#14181F" stroke="none" />
  <circle cx="19" cy="42" r="1.2" fill="#14181F" stroke="none" />
  <circle cx="45" cy="42" r="1.2" fill="#14181F" stroke="none" />
  <!-- Vault Feet -->
  <path d="M15 52v3h6v-3M43 52v3h6v-3" stroke-width="3" />
  <!-- Left Side Hinges -->
  <rect x="7" y="18" width="2.5" height="5" rx="0.8" fill="#14181F" stroke="none" />
  <rect x="7" y="37" width="2.5" height="5" rx="0.8" fill="#14181F" stroke="none" />
  <!-- Central Rotary Vault Dial -->
  <circle cx="32" cy="31" r="8" stroke-width="2.8" />
  <circle cx="32" cy="31" r="2.8" fill="#14181F" stroke="none" />
  <!-- Dial Handles / Spokes -->
  <path d="M26.5 25.5l-3.5-3.5M37.5 25.5l3.5-3.5M26.5 36.5l-3.5 3.5M37.5 36.5l3.5 3.5" stroke-width="2.6" />
</svg>`,

  'savings-loans': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#14181F" stroke-linecap="round" stroke-linejoin="round">
  <!-- Banknote / Cash in Background -->
  <rect x="23" y="14" width="33" height="22" rx="2" stroke-width="2.6" />
  <rect x="26" y="17" width="27" height="16" rx="1" stroke-width="1.2" stroke-dasharray="2.5 2" />
  <circle cx="39.5" cy="25" r="4.2" stroke-width="2" />
  <!-- Primary Coin Stack (4 layers) -->
  <ellipse cx="20" cy="27" rx="11" ry="4" stroke-width="2.8" />
  <path d="M9 27v6c0 2.2 4.9 4 11 4s11-1.8 11-4v-6" stroke-width="2.8" />
  <path d="M9 33v6c0 2.2 4.9 4 11 4s11-1.8 11-4v-6" stroke-width="2.8" />
  <path d="M9 39v6c0 2.2 4.9 4 11 4s11-1.8 11-4v-6" stroke-width="2.8" />
  <!-- Wealth Sparkles / Radiance Rays -->
  <path d="M20 18v-5M13 19l-3-4M27 19l3-4" stroke-width="2.4" />
  <!-- Secondary Coin Stack -->
  <ellipse cx="37" cy="41" rx="8" ry="3" stroke-width="2.5" />
  <path d="M29 41v5c0 1.65 3.6 3 8 3s8-1.35 8-3v-5" stroke-width="2.5" />
</svg>`,

  'activities': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#14181F" stroke-linecap="round" stroke-linejoin="round">
  <!-- Arrowhead at top left pointing down/counter-clockwise -->
  <polyline points="10,13 10,25 22,25" stroke-width="4.2" />
  <!-- Sweeping Counter-Clockwise Circular Path -->
  <path d="M10 25 A 21 21 0 1 1 32 53 A 21 21 0 0 1 16 43" stroke-width="4.2" />
  <!-- Clock Hands in Center -->
  <polyline points="32,20 32,32 41,37" stroke-width="4" />
</svg>`
};

async function main() {
  for (const [name, svgContent] of Object.entries(icons)) {
    const svgPath = path.join(targetDir, `${name}.svg`);
    const pngPath = path.join(targetDir, `${name}.png`);
    const webpPath = path.join(targetDir, `${name}.webp`);

    fs.writeFileSync(svgPath, svgContent);
    const buffer = Buffer.from(svgContent);

    await sharp(buffer)
      .resize(320, 320)
      .png()
      .toFile(pngPath);

    await sharp(buffer)
      .resize(320, 320)
      .webp({ lossless: true })
      .toFile(webpPath);
  }
  console.log('All action icons regenerated with perfect vector precision!');
}

main().catch(console.error);
