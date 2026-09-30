const fs = require('fs');
const path = 'c:\\Users\\Handicap\\Documents\\jph\\app\\(portal)\\accounts\\AccountsClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<AccountAnalytics\s*currency=\{userPreferences\.currency\}\s*totalLiquidAssets=\{totalLiquidAssets\}\s*activeAccountsCount=\{activeAccountsCount\}\s*onDrilldown=\{handleKpiDrilldown\}\s*\/>/;

const newContent = `<AccountAnalytics
        currency={userPreferences.currency}
        totalLiquidAssets={totalLiquidAssets}
        activeAccountsCount={activeAccountsCount}
        pendingActionsCount={pendingActionsCount}
        onDrilldown={handleKpiDrilldown}
      />`;

if (regex.test(content)) {
  content = content.replace(regex, newContent);
  fs.writeFileSync(path, content);
  console.log("Replaced AccountAnalytics");
} else {
  console.log("Regex did not match");
}
