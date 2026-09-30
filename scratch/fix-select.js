const fs = require('fs');
const path = 'c:\\Users\\Handicap\\Documents\\jph\\app\\(portal)\\accounts\\AccountsClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<Select value=\{sortOrder\} onValueChange=\{setSortOrder\}>[\s\S]*?<\/Select>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/>/;
const match = content.match(regex);
if (match) {
  content = content.replace(regex, '</div>\n        </div>\n      </div>\n      </>');
  fs.writeFileSync(path, content);
  console.log("Fixed duplicate Select.");
} else {
  console.log("Could not find regex match.");
}
