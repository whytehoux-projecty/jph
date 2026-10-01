const fs = require('fs');

const pages = {
    'security': `# Security Center\n\nAt {{BRAND.legalName}}, your security is our top priority. We employ state-of-the-art encryption to protect your financial data.\n\n## Important Security Notice\nWe will **never** ask for your password, PIN, or One-Time Passcode (OTP) via phone, email, or text. If you receive such a request, hang up and contact us immediately.\n\n## Helpful Resources\n- [Contact Us](/contact)\n- [Help & Support](/help)`,
    'help': `# Help & Support\n\n## Account Questions\n**How do I open a new account?**\nYou can open a new account online by visiting our [Apply](/apply) page.\n\n**How do I reset my password?**\nClick 'Forgot Password' on the login screen to reset your password.\n\n## Vault Digital Banking\n**How do I access Vault?**\nYou can access Vault by clicking 'Sign in' or navigating to our [Login](/login) page.\n\n## Loans\n**How long does a loan application take?**\nMost personal loans are approved within 1-2 business days.`,
    'locations': `# Branches & ATMs\n\n{{BRAND.shortName}} operates branches throughout our region to serve your needs.\n\n## Headquarters\n{{BRAND.legalName}}\n{{BRAND.address}}\n\n## Operating Hours\nMonday - Friday: 9:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday: Closed\n\n*ATM access is available 24/7 at all branch locations.*`,
    'rates-and-fees': `# Rates & Fees\n\n*Rates are effective as of the current date and are subject to change without notice.*\n\n## Deposit Accounts\n\n| Account Type | Minimum Balance | APY |\n|--------------|-----------------|-----|\n| Checking | $0 | 0.00% |\n| Savings | $500 | 2.15% |\n\n## Fee Schedule\n- Monthly Maintenance: $0\n- Overdraft Fee: $35\n- Wire Transfer (Domestic): $15`,
    'accessibility': `# Accessibility Statement\n\n{{BRAND.legalName}} is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards.\n\nIf you have difficulty using or accessing any element of this website, please [Contact Us](/contact).`,
    'careers': `# Careers\n\nJoin the team at {{BRAND.shortName}} and help us build the future of banking.\n\n## Open Positions\n\n**Senior Commercial Loan Officer**\n*Location:* Remote / Hybrid\n\n**Customer Experience Representative**\n*Location:* Headquarters\n\n**Digital Product Manager**\n*Location:* Remote\n\n**Financial Analyst**\n*Location:* Headquarters\n\n**Branch Manager**\n*Location:* Downtown Branch\n\n*Please send your resume to our HR department to apply.*`,
    'press': `# Press Room\n\nRecent news and updates from {{BRAND.legalName}}.\n\n- **{{BRAND.shortName}} Announces Expansion of Small Business Lending**\n- **New Vault Digital Banking Features Released**\n- **{{BRAND.shortName}} Recognized for Community Service**\n- **Annual Shareholder Meeting Scheduled**\n- **{{BRAND.shortName}} Launches Financial Literacy Initiative**`,
    'investors': `# Investor Relations\n\n{{BRAND.legalName}} is a privately held financial institution committed to sustainable growth and long-term value creation.\n\nFor investor inquiries, please [Contact Us](/contact).`
};

for (const [slug, content] of Object.entries(pages)) {
    fs.writeFileSync(`src/content/pages/${slug}.md`, content);
}
console.log('Pages written');
