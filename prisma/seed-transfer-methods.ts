import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingCount = await prisma.transferMethodConfig.count();
  if (existingCount > 0) {
    console.log('Transfer method configs already exist. Skipping seed.');
    return;
  }

  const defaultMethods = [
    {
      methodId: "internal",
      displayName: "Internal Transfer",
      description: "Between your Heritage Trust accounts",
      processingTime: "Instant",
      feeLabel: "$0.00",
      baseFee: 0,
      percentageFee: 0,
      dailyLimit: 50000,
      perTransferLimit: 50000,
      formConfig: JSON.stringify(["toAccountId", "amount", "description"]),
      sortOrder: 1,
    },
    {
      methodId: "ach",
      displayName: "ACH / Domestic Wire",
      description: "To any US bank account",
      processingTime: "1-3 days",
      feeLabel: "Free - $25",
      baseFee: 25,
      percentageFee: 0,
      dailyLimit: 100000,
      perTransferLimit: 50000,
      formConfig: JSON.stringify(["routingNumber", "accountNumber", "accountType", "amount", "description"]),
      sortOrder: 2,
    },
    {
      methodId: "wire_international",
      displayName: "International Wire",
      description: "Send money worldwide (SWIFT)",
      processingTime: "1-5 days",
      feeLabel: "From $45.00",
      baseFee: 45,
      percentageFee: 0,
      dailyLimit: 250000,
      perTransferLimit: 100000,
      formConfig: JSON.stringify(["swiftCode", "iban", "recipientAddress", "intermediaryBank", "purposeCode", "amount", "description"]),
      sortOrder: 3,
    },
    {
      methodId: "zelle",
      displayName: "Zelle",
      description: "Send to email or phone number",
      processingTime: "Instant",
      feeLabel: "$0.00",
      baseFee: 0,
      percentageFee: 0,
      dailyLimit: 2500,
      perTransferLimit: 1000,
      formConfig: JSON.stringify(["zelleIdentifier", "amount", "description"]),
      sortOrder: 4,
    },
    {
      methodId: "crypto",
      displayName: "Crypto Wallet",
      description: "Bank-to-wallet transfer",
      processingTime: "Instant",
      feeLabel: "Network fee",
      baseFee: 0,
      percentageFee: 0,
      dailyLimit: 25000,
      perTransferLimit: 10000,
      formConfig: JSON.stringify(["asset", "network", "walletAddress", "amount", "description"]),
      badge: "NEW",
      sortOrder: 5,
    },
    {
      methodId: "fednow",
      displayName: "FedNow Instant",
      description: "Instant 24/7 bank-to-bank",
      processingTime: "Instant",
      feeLabel: "$0.00",
      baseFee: 0,
      percentageFee: 0,
      dailyLimit: 500000,
      perTransferLimit: 100000,
      formConfig: JSON.stringify(["routingNumber", "accountNumber", "amount", "description"]),
      sortOrder: 6,
    },
    {
      methodId: "cashapp",
      displayName: "Cash App",
      description: "Send via $Cashtag",
      processingTime: "Instant",
      feeLabel: "$0.00",
      baseFee: 0,
      percentageFee: 0,
      dailyLimit: 2500,
      perTransferLimit: 1000,
      formConfig: JSON.stringify(["cashtag", "amount", "description"]),
      sortOrder: 7,
    },
    {
      methodId: "venmo",
      displayName: "Venmo",
      description: "Send via @Username",
      processingTime: "Instant",
      feeLabel: "$0.00",
      baseFee: 0,
      percentageFee: 0,
      dailyLimit: 2500,
      perTransferLimit: 1000,
      formConfig: JSON.stringify(["venmoUsername", "amount", "description"]),
      sortOrder: 8,
    }
  ];

  for (const method of defaultMethods) {
    await prisma.transferMethodConfig.create({ data: method });
  }

  console.log('Seeded transfer method configs successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
