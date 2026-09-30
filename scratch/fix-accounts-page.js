const fs = require('fs');
const path = 'c:\\Users\\Handicap\\Documents\\jph\\app\\(portal)\\accounts\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

// We need to add prisma import and fetch pending actions.
if (!content.includes('import { prisma }')) {
  content = content.replace('import { redirect } from "next/navigation";', 'import { redirect } from "next/navigation";\nimport { prisma } from "@/lib/prisma";');
}

// Now replace the fetch logic
const fetchLogicRegex = /let user, rawAccounts;[\s\S]*?\} catch \(error\) \{[\s\S]*?redirect\('\/login'\);[\s\S]*?\}/;

const fetchLogic = `let user, rawAccounts, pendingActionsCount = 0;
  
  try {
    user = await getProfile();
    rawAccounts = await getAccounts();
    if (user?.id) {
      // Calculate pending actions for the user
      const unreadNotifications = await prisma.notification.count({ where: { userId: user.id, isRead: false } });
      const pendingTx = await prisma.transaction.count({ where: { account: { userId: user.id }, status: 'PENDING' } });
      const pendingTickets = await prisma.supportTicket.count({ where: { userId: user.id, status: 'OPEN' } });
      
      pendingActionsCount = unreadNotifications + pendingTx + pendingTickets;
    }
  } catch (error) {
    redirect('/login');
  }`;

content = content.replace(fetchLogicRegex, fetchLogic);

// Replace AccountsClient render
const clientRenderRegex = /<AccountsClient\s*initialAccounts=\{initialAccounts\}\s*userPreferences=\{userPreferences\}\s*\/>/;

const clientRender = `<AccountsClient 
      initialAccounts={initialAccounts}
      userPreferences={userPreferences}
      pendingActionsCount={pendingActionsCount}
      promoMessage={user?.eportalNotificationMessage || null}
    />`;

content = content.replace(clientRenderRegex, clientRender);

fs.writeFileSync(path, content);
console.log("Replaced accounts/page.tsx");
