const fs = require('fs');

const path = 'c:\\Users\\Handicap\\Documents\\jph\\app\\(portal)\\accounts\\AccountsClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  'import { AccountCard, Account } from "./components/AccountCard";',
  `import { AccountCard, Account } from "./components/AccountCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchInput } from "@/components/ui/SearchInput";
import { SortSelect } from "@/components/ui/SortSelect";
import { PromoBanner } from "@/components/ui/PromoBanner";`
);

// 2. Add hasAccounts
content = content.replace(
  'const locale = languageToLocale(userPreferences.language);',
  `const locale = languageToLocale(userPreferences.language);
  const hasAccounts = accounts.length > 0;`
);

// 3. Fix empty state icon
content = content.replace(
  '<Landmark className="w-8 h-8 text-muted-foreground" />',
  '<VintageIcon name="pillars" className="w-8 h-8 text-muted-foreground" />'
);

// 4. Update PromoBanner
content = content.replace(
  /<div className="flex items-start justify-between gap-3 rounded-xl border border-\[color:var\(--heritage-navy\)\]\/15 bg-\[color:var\(--heritage-surface\)\]\/90 px-4 py-3 shadow-sm">[\s\S]*?<\/div>\s*<\/div>/,
  `<PromoBanner
          title="Private concierge upgrade"
          body="Unlock tailored wealth management with our private concierge team."
          ctaLabel="Learn more"
          onCtaClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/support";
            }
          }}
          onDismiss={handlePromoDismiss}
        />`
);

// 5. Update Header Plus & Refresh Icons to stroke-[2]
content = content.replace(
  /<RefreshCw\s*className={`w-4 h-4 mr-2 \${isLoading \? "animate-spin" : ""}`}\s*\/>/g,
  '<RefreshCw className={`w-4 h-4 mr-2 stroke-[2] ${isLoading ? "animate-spin" : ""}`} />'
);
content = content.replace(
  '<Plus className="w-4 h-4 mr-2" />',
  '<Plus className="w-4 h-4 mr-2 stroke-[2]" />'
);

// 6. Gate AccountAnalytics and Filter Bar behind hasAccounts
const kpiRegex = /\{\/\* KPI Analytics — not sticky, scrolls away \*\/\}\s*<AccountAnalytics[\s\S]*?\/>/;
const kpiMatch = content.match(kpiRegex);
if (kpiMatch) {
  content = content.replace(kpiMatch[0], `{hasAccounts && (\n      <>\n      ${kpiMatch[0]}`);
}

const filterBarRegex = /\{\/\* Filter Bar — sticky, stays visible while scrolling the account grid \*\/\}\s*<div className="sticky top-\[70px\] z-30[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const filterBarMatch = content.match(filterBarRegex);

if (filterBarMatch) {
  let filterBarReplaced = filterBarMatch[0].replace(
    /<div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">[\s\S]*?<\/div>/,
    `<SegmentedControl
              options={["all", "checking", "savings", "credit", "investment"]}
              value={filterType}
              onChange={setFilterType}
            />`
  );
  filterBarReplaced = filterBarReplaced.replace(
    /<div className="flex items-center gap-2 w-full md:w-auto">[\s\S]*?<\/div>/,
    `<div className="flex items-center gap-2 w-full md:w-auto flex-1 md:flex-none justify-end">
              <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by nickname or last 4 digits..." />
              <SortSelect value={sortOrder} onChange={setSortOrder} />
            </div>`
  );

  content = content.replace(filterBarMatch[0], filterBarReplaced + '\n      </>\n      )}');
}

fs.writeFileSync(path, content);
console.log("Updated AccountsClient.tsx");
