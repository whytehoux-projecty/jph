import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding JPHeritage database...');

  // Wipe existing records cleanly
  await prisma.statement.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.payee.deleteMany();
  await prisma.card.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.beneficiary.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.accountApplication.deleteMany();
  await prisma.onlineAccessRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.adminUser.deleteMany();

  // 1. Admin user
  const adminHashed = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@jpheritage.com',
      password: adminHashed,
      firstName: 'Admin',
      lastName: 'Heritage',
      role: 'ADMIN',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // 2. Demo Users
  const demoHashed = await bcrypt.hash('Demo123!', 10);

  const john = await prisma.user.create({
    data: {
      email: 'john.doe@jpheritage.com',
      password: demoHashed,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1 (555) 019-2834',
      dateOfBirth: new Date('1985-06-15'),
      address: '742 Evergreen Terrace',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      status: 'ACTIVE',
      tier: 'PREMIUM',
      hasOnlineAccess: true,
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      twoFactorEnabled: false,
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane.smith@jpheritage.com',
      password: demoHashed,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1 (555) 839-1029',
      dateOfBirth: new Date('1992-11-20'),
      address: '120 Wall Street, Apt 14B',
      city: 'New York',
      state: 'NY',
      zipCode: '10005',
      status: 'ACTIVE',
      tier: 'STANDARD',
      hasOnlineAccess: true,
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
      twoFactorEnabled: false,
    },
  });

  console.log('Created users John Doe and Jane Smith');

  // 3. Accounts for John Doe
  const johnChecking = await prisma.account.create({
    data: {
      userId: john.id,
      accountNumber: '1002938471',
      accountType: 'CHECKING',
      currency: 'USD',
      balance: 24580.45,
      status: 'ACTIVE',
    },
  });

  const johnSavings = await prisma.account.create({
    data: {
      userId: john.id,
      accountNumber: '1002938472',
      accountType: 'SAVINGS',
      currency: 'USD',
      balance: 85200.00,
      status: 'ACTIVE',
    },
  });

  const johnCredit = await prisma.account.create({
    data: {
      userId: john.id,
      accountNumber: '1002938473',
      accountType: 'CREDIT',
      currency: 'USD',
      balance: -1420.50,
      status: 'ACTIVE',
    },
  });

  // Accounts for Jane Smith
  const janeChecking = await prisma.account.create({
    data: {
      userId: jane.id,
      accountNumber: '2002938471',
      accountType: 'CHECKING',
      currency: 'USD',
      balance: 12450.00,
      status: 'ACTIVE',
    },
  });

  const janeSavings = await prisma.account.create({
    data: {
      userId: jane.id,
      accountNumber: '2002938472',
      accountType: 'SAVINGS',
      currency: 'USD',
      balance: 34000.00,
      status: 'ACTIVE',
    },
  });

  const janeCredit = await prisma.account.create({
    data: {
      userId: jane.id,
      accountNumber: '2002938473',
      accountType: 'CREDIT',
      currency: 'USD',
      balance: -650.00,
      status: 'ACTIVE',
    },
  });

  // 4. Cards for John Doe (Checking)
  await prisma.card.create({
    data: {
      accountId: johnChecking.id,
      cardNumber: '4532890123456789',
      cardType: 'DEBIT',
      network: 'VISA',
      expiryDate: new Date('2029-08-01'),
      cvv: '789',
      status: 'ACTIVE',
    },
  });

  await prisma.card.create({
    data: {
      accountId: johnChecking.id,
      cardNumber: '5412750198765432',
      cardType: 'CREDIT',
      network: 'MASTERCARD',
      expiryDate: new Date('2030-12-01'),
      cvv: '456',
      status: 'ACTIVE',
    },
  });

  // Cards for Jane Smith
  await prisma.card.create({
    data: {
      accountId: janeChecking.id,
      cardNumber: '4111222233334444',
      cardType: 'DEBIT',
      network: 'VISA',
      expiryDate: new Date('2028-05-01'),
      cvv: '321',
      status: 'ACTIVE',
    },
  });

  // 5. Beneficiaries for John Doe
  await prisma.beneficiary.createMany({
    data: [
      {
        userId: john.id,
        name: 'Jane Smith',
        accountNumber: '2002938471',
        bankName: 'JP Heritage Bank',
        isInternal: true,
      },
      {
        userId: john.id,
        name: 'Robert Vance',
        accountNumber: '1009988776',
        bankName: 'JP Heritage Bank',
        isInternal: true,
      },
      {
        userId: john.id,
        name: 'Apex Real Estate Partners',
        accountNumber: '9988776655',
        bankName: 'Chase Bank NA',
        swiftCode: 'CHASUS33',
        isInternal: false,
      },
      {
        userId: john.id,
        name: 'Morgan Stanley Wealth',
        accountNumber: '4455667788',
        bankName: 'Morgan Stanley',
        swiftCode: 'MSTYUS33',
        isInternal: false,
      },
      {
        userId: john.id,
        name: 'London Heritage Trust',
        accountNumber: '3344556677',
        bankName: 'Barclays UK',
        swiftCode: 'BARCGB22',
        isInternal: false,
      },
    ],
  });

  // Beneficiaries for Jane Smith
  await prisma.beneficiary.createMany({
    data: [
      {
        userId: jane.id,
        name: 'John Doe',
        accountNumber: '1002938471',
        bankName: 'JP Heritage Bank',
        isInternal: true,
      },
      {
        userId: jane.id,
        name: 'Con Edison Billing',
        accountNumber: '7766554433',
        bankName: 'Citibank NA',
        swiftCode: 'CITIUS33',
        isInternal: false,
      },
    ],
  });

  // 6. Savings Goals
  await prisma.savingsGoal.create({
    data: {
      userId: john.id,
      name: 'Luxury Villa Vacation',
      targetAmount: 25000,
      currentAmount: 11250,
      targetDate: new Date('2027-06-30'),
    },
  });

  await prisma.savingsGoal.create({
    data: {
      userId: jane.id,
      name: 'Emergency Reserve Fund',
      targetAmount: 20000,
      currentAmount: 8500,
      targetDate: new Date('2027-03-31'),
    },
  });

  // 7. Payees and Bills
  const johnPayee1 = await prisma.payee.create({
    data: {
      userId: john.id,
      name: 'Con Edison Utility',
      accountNumber: 'UTIL-CONED-991',
      category: 'UTILITIES',
      country: 'usa',
    },
  });

  const johnPayee2 = await prisma.payee.create({
    data: {
      userId: john.id,
      name: 'Netflix Entertainment',
      accountNumber: 'SUB-NFLX-441',
      category: 'ENTERTAINMENT',
      country: 'usa',
    },
  });

  await prisma.bill.create({
    data: {
      accountId: johnChecking.id,
      payeeId: johnPayee1.id,
      amount: 145.20,
      status: 'PENDING',
    },
  });

  await prisma.bill.create({
    data: {
      accountId: johnChecking.id,
      payeeId: johnPayee2.id,
      amount: 22.99,
      status: 'PAID',
      paidAt: new Date(Date.now() - 15 * 86400000),
    },
  });

  // 8. Notifications for John Doe
  await prisma.notification.createMany({
    data: [
      {
        userId: john.id,
        title: 'Security Alert',
        message: 'New sign-in detected from macOS device in New York, USA.',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 3600000),
      },
      {
        userId: john.id,
        title: 'Wire Transfer Completed',
        message: 'Your international wire transfer of $5,000.00 to Barclays UK has been processed.',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 3600000),
      },
      {
        userId: john.id,
        title: 'Monthly Statement Ready',
        message: 'Your account statement for August 2026 is now available for download.',
        isRead: true,
        createdAt: new Date(Date.now() - 48 * 3600000),
      },
    ],
  });

  // 9. Statements
  await prisma.statement.createMany({
    data: [
      {
        accountId: johnChecking.id,
        period: '2026-08',
        filePath: '/statements/demo.pdf',
        generatedAt: new Date('2026-08-31'),
      },
      {
        accountId: johnChecking.id,
        period: '2026-07',
        filePath: '/statements/demo.pdf',
        generatedAt: new Date('2026-07-31'),
      },
      {
        accountId: johnSavings.id,
        period: '2026-08',
        filePath: '/statements/demo.pdf',
        generatedAt: new Date('2026-08-31'),
      },
    ],
  });

  // 10. 25+ realistic transactions per account spread across past 6 months
  const now = Date.now();
  const DAY = 86400000;

  const checkingTransactions = [
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 6250.00, desc: 'Direct Deposit - Global Tech Inc', status: 'APPROVED', daysAgo: 2 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -142.80, desc: 'Whole Foods Market', status: 'APPROVED', daysAgo: 3 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -18.50, desc: 'Starbucks Coffee', status: 'APPROVED', daysAgo: 4 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -245.00, desc: 'Equinox Fitness Club', status: 'APPROVED', daysAgo: 6 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -85.20, desc: 'Uber Transportation', status: 'APPROVED', daysAgo: 8 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 1200.00, desc: 'Consulting Advisory Fee', status: 'APPROVED', daysAgo: 10 },
    { type: 'DEBIT', tType: 'INT_WIRE', amount: -5000.00, desc: 'Wire Transfer - London Heritage Trust', status: 'APPROVED', daysAgo: 12 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -210.40, desc: 'Amazon.com Marketplace', status: 'APPROVED', daysAgo: 15 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -75.00, desc: 'Le Bernardin Dining', status: 'APPROVED', daysAgo: 18 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 6250.00, desc: 'Direct Deposit - Global Tech Inc', status: 'APPROVED', daysAgo: 32 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -3200.00, desc: 'Apartment Rental Payment', status: 'APPROVED', daysAgo: 33 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -160.00, desc: 'Con Edison Electric', status: 'APPROVED', daysAgo: 35 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -89.99, desc: 'Nordstrom NYC', status: 'APPROVED', daysAgo: 38 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -12.50, desc: 'Blue Bottle Coffee', status: 'APPROVED', daysAgo: 42 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -450.00, desc: 'Delta Air Lines Travel', status: 'APPROVED', daysAgo: 48 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 6250.00, desc: 'Direct Deposit - Global Tech Inc', status: 'APPROVED', daysAgo: 62 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -3200.00, desc: 'Apartment Rental Payment', status: 'APPROVED', daysAgo: 63 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -340.00, desc: 'Apple Store Fifth Ave', status: 'APPROVED', daysAgo: 70 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -65.30, desc: 'Trader Joe\'s Grocery', status: 'APPROVED', daysAgo: 75 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 850.00, desc: 'Vanguard Dividend Payment', status: 'APPROVED', daysAgo: 85 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 6250.00, desc: 'Direct Deposit - Global Tech Inc', status: 'APPROVED', daysAgo: 92 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -3200.00, desc: 'Apartment Rental Payment', status: 'APPROVED', daysAgo: 93 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -540.00, desc: 'Four Seasons Hotel', status: 'APPROVED', daysAgo: 105 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 6250.00, desc: 'Direct Deposit - Global Tech Inc', status: 'APPROVED', daysAgo: 122 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -3200.00, desc: 'Apartment Rental Payment', status: 'APPROVED', daysAgo: 123 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -750.00, desc: 'Pending Vendor Invoice #892', status: 'PENDING', daysAgo: 1 },
  ];

  for (let i = 0; i < checkingTransactions.length; i++) {
    const tx = checkingTransactions[i];
    await prisma.transaction.create({
      data: {
        accountId: johnChecking.id,
        type: tx.type,
        transactionType: tx.tType,
        amount: tx.amount,
        currency: 'USD',
        status: tx.status,
        description: tx.desc,
        reference: `REF-CHK-${1000 + i}`,
        processedAt: new Date(now - tx.daysAgo * DAY),
        createdAt: new Date(now - tx.daysAgo * DAY),
      },
    });
  }

  // Savings Transactions for John
  const savingsTransactions = [
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 2000.00, desc: 'Monthly Automated Savings', status: 'APPROVED', daysAgo: 2 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 150.25, desc: 'High-Yield Interest Payment', status: 'APPROVED', daysAgo: 14 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 2000.00, desc: 'Monthly Automated Savings', status: 'APPROVED', daysAgo: 32 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 148.10, desc: 'High-Yield Interest Payment', status: 'APPROVED', daysAgo: 44 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 5000.00, desc: 'Bonus Allocation Deposit', status: 'APPROVED', daysAgo: 50 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 2000.00, desc: 'Monthly Automated Savings', status: 'APPROVED', daysAgo: 62 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 142.50, desc: 'High-Yield Interest Payment', status: 'APPROVED', daysAgo: 74 },
    { type: 'DEBIT', tType: 'LOCAL_TRANSFER', amount: -1500.00, desc: 'Transfer to Checking', status: 'APPROVED', daysAgo: 80 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 2000.00, desc: 'Monthly Automated Savings', status: 'APPROVED', daysAgo: 92 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 139.80, desc: 'High-Yield Interest Payment', status: 'APPROVED', daysAgo: 104 },
    { type: 'CREDIT', tType: 'LOCAL_TRANSFER', amount: 2000.00, desc: 'Monthly Automated Savings', status: 'APPROVED', daysAgo: 122 },
  ];

  for (let i = 0; i < savingsTransactions.length; i++) {
    const tx = savingsTransactions[i];
    await prisma.transaction.create({
      data: {
        accountId: johnSavings.id,
        type: tx.type,
        transactionType: tx.tType,
        amount: tx.amount,
        currency: 'USD',
        status: tx.status,
        description: tx.desc,
        reference: `REF-SAV-${2000 + i}`,
        processedAt: new Date(now - tx.daysAgo * DAY),
        createdAt: new Date(now - tx.daysAgo * DAY),
      },
    });
  }

  // Also seed some applications for Admin view
  await prisma.accountApplication.create({
    data: {
      applicationType: 'PERSONAL',
      firstName: 'Michael',
      lastName: 'Chang',
      email: 'mchang@example.com',
      phone: '+1 (555) 443-2211',
      dateOfBirth: new Date('1988-03-12'),
      address: '450 Lexington Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10017',
      employmentStatus: 'EMPLOYED',
      annualIncome: 185000,
      status: 'PENDING',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
