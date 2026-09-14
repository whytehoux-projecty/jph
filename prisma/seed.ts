import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a dummy user
  const user = await prisma.user.upsert({
    where: { email: 'demo@jpheritage.com' },
    update: {},
    create: {
      email: 'demo@jpheritage.com',
      password: 'hashed_password_placeholder', // Dummy password
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1 (555) 123-4567',
      dateOfBirth: new Date('1990-01-01'),
      address: '123 Heritage Way',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      status: 'ACTIVE',
      tier: 'PREMIUM',
      hasOnlineAccess: true,
      preferredLanguage: 'en',
      preferredCurrency: 'USD',
    },
  });

  console.log(`Created user: ${user.firstName} ${user.lastName}`);

  // 2. Create Accounts
  const checkingAccount = await prisma.account.create({
    data: {
      userId: user.id,
      accountNumber: 'CHK-90928374',
      accountType: 'CHECKING',
      currency: 'USD',
      balance: 15420.50,
      status: 'ACTIVE',
    },
  });

  const savingsAccount = await prisma.account.create({
    data: {
      userId: user.id,
      accountNumber: 'SAV-55667788',
      accountType: 'SAVINGS',
      currency: 'USD',
      balance: 45000.00,
      status: 'ACTIVE',
    },
  });

  console.log(`Created accounts for user: ${checkingAccount.accountNumber}, ${savingsAccount.accountNumber}`);

  // 3. Create Transactions
  await prisma.transaction.createMany({
    data: [
      {
        accountId: checkingAccount.id,
        type: 'CREDIT',
        transactionType: 'LOCAL_TRANSFER',
        amount: 3200.00,
        currency: 'USD',
        status: 'APPROVED',
        description: 'Salary Deposit - Tech Corp',
        reference: 'REF-SAL-10293',
        processedAt: new Date(),
      },
      {
        accountId: checkingAccount.id,
        type: 'DEBIT',
        transactionType: 'LOCAL_TRANSFER',
        amount: -120.50,
        currency: 'USD',
        status: 'APPROVED',
        description: 'Grocery Store - Whole Foods',
        reference: 'REF-GROC-9921',
        processedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        accountId: savingsAccount.id,
        type: 'CREDIT',
        transactionType: 'LOCAL_TRANSFER',
        amount: 1500.00,
        currency: 'USD',
        status: 'APPROVED',
        description: 'Monthly Savings Transfer',
        reference: 'REF-SAV-5544',
        processedAt: new Date(Date.now() - 172800000), // 2 days ago
      },
    ],
  });

  console.log('Created transactions.');

  // 4. Create Card
  await prisma.card.create({
    data: {
      accountId: checkingAccount.id,
      cardNumber: '**** **** **** 4921',
      cardType: 'DEBIT',
      network: 'VISA',
      expiryDate: new Date('2028-12-31'),
      cvv: '***',
      status: 'ACTIVE',
    },
  });

  console.log('Created cards.');

  // 5. Create Beneficiaries
  await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'Alice Smith',
      accountNumber: 'ACC-11223344',
      bankName: 'Chase Bank',
      swiftCode: 'CHASUS33',
      isInternal: false,
    },
  });

  console.log('Created beneficiaries.');

  // 6. Create Savings Goal
  await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: 'New Car',
      targetAmount: 35000.00,
      currentAmount: 12500.00,
      targetDate: new Date('2026-12-31'),
    },
  });

  console.log('Created savings goals.');

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
