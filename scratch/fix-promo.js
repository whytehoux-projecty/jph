const fs = require('fs');
const path = 'c:\\Users\\Handicap\\Documents\\jph\\app\\(portal)\\accounts\\AccountsClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\{showPromo && \(\s*<PromoBanner\s*title="Private concierge upgrade"\s*body="Unlock tailored wealth management with our private concierge team\."\s*ctaLabel="Learn more"\s*onCtaClick=\{\(\) => \{\s*if \(typeof window !== "undefined"\) \{\s*window\.location\.href = "\/support";\s*\}\s*\}\}\s*onDismiss=\{handlePromoDismiss\}\s*\/>\s*\)\}/;

const newContent = `{showPromo && promoMessage && (
        <PromoBanner
          title="Important Notice"
          body={promoMessage}
          ctaLabel="View Details"
          onCtaClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/support";
            }
          }}
          onDismiss={handlePromoDismiss}
        />
      )}`;

if (regex.test(content)) {
  content = content.replace(regex, newContent);
  fs.writeFileSync(path, content);
  console.log("Replaced PromoBanner");
} else {
  console.log("Regex did not match");
}
