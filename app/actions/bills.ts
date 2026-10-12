'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { parseUserFeatureOverrides, type BillMethodsOverrides } from '@/lib/feature-overrides';

export interface UserBillPermissions {
  enabled: boolean;
  methods: BillMethodsOverrides;
}

export async function getUserBillPermissions(): Promise<UserBillPermissions> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      enabled: false,
      methods: { providers: false, einvoice: false },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { transferMethodOverrides: true },
  });

  const parsed = parseUserFeatureOverrides(user?.transferMethodOverrides);
  return {
    enabled: parsed.bills.enabled,
    methods: parsed.bills.methods,
  };
}

export async function getPayees() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const payees = await prisma.payee.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return payees;
}

export async function addPayee(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const payee = await prisma.payee.create({
    data: {
      userId: session.user.id,
      name: data.name,
      accountNumber: data.accountNumber,
      category: data.category || 'OTHER',
      country: data.country || 'usa'
    }
  });

  revalidatePath('/bills');
  revalidatePath('/admin/ebank/bill-services');
  return payee;
}

export async function deletePayee(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const payee = await prisma.payee.findUnique({ where: { id } });
  if (!payee || payee.userId !== session.user.id) throw new Error('Unauthorized');

  await prisma.payee.delete({ where: { id } });
  revalidatePath('/bills');
  revalidatePath('/admin/ebank/bill-services');
  return { success: true };
}

export async function payBill(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const { accountId, payeeId, amount, date } = data;

  // 1. Verify customer bill payment permissions
  const permissions = await getUserBillPermissions();
  if (!permissions.enabled) {
    throw new Error('Bill payment facilities are currently restricted on your account. Please consult with your relationship manager.');
  }

  const isEinvoice = data.source === 'EINVOICE_PIPELINE' || data.category === 'E-INVOICE';
  if (isEinvoice && !permissions.methods.einvoice) {
    throw new Error('E-Invoice ticket upload & automated pipeline is currently disabled for your account profile.');
  }
  if (!isEinvoice && !permissions.methods.providers) {
    throw new Error('Direct bill provider directory payments are currently disabled for your account profile.');
  }

  // 2. Validate account ownership
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== session.user.id) throw new Error('Unauthorized');

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Invalid payment amount. Must be greater than zero.');
  }

  // 3. Locate or create payee in DB
  let actualPayeeId = payeeId;
  let payeeName = data.name || "Provider";

  if (actualPayeeId) {
    const existingPayee = await prisma.payee.findUnique({ where: { id: actualPayeeId } });
    if (existingPayee) {
      payeeName = existingPayee.name;
    } else {
      actualPayeeId = undefined;
    }
  }

  if (!actualPayeeId && data.name) {
    let userPayee = await prisma.payee.findFirst({
      where: {
        userId: session.user.id,
        name: data.name,
      }
    });

    if (!userPayee) {
      userPayee = await prisma.payee.create({
        data: {
          userId: session.user.id,
          name: data.name,
          accountNumber: data.accountNumber || 'ACC-' + Math.floor(100000 + Math.random() * 900000),
          category: data.category || 'UTILITIES',
          country: data.country || 'usa',
        }
      });
    }
    actualPayeeId = userPayee.id;
    payeeName = userPayee.name;
  }

  if (!actualPayeeId) {
    throw new Error('Could not determine payee record for bill payment.');
  }

  // 4. Create bill record with PENDING status
  const bill = await prisma.bill.create({
    data: {
      accountId,
      payeeId: actualPayeeId,
      amount: numAmount,
      status: 'PENDING'
    }
  });

  const ref = 'BIL-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  // 5. Create matching transaction record
  const transaction = await prisma.transaction.create({
    data: {
      accountId,
      type: 'DEBIT',
      transactionType: 'BILL_PAYMENT',
      amount: numAmount,
      status: 'PENDING',
      description: `Bill Payment · ${payeeName}`,
      reference: ref,
      category: 'BILLS',
      channel: isEinvoice ? 'E_INVOICE' : 'PORTAL',
      counterparty: JSON.stringify({
        name: payeeName,
        accountNumber: data.accountNumber || 'ACC-DIRECT',
        category: data.category || 'UTILITIES',
      }),
      metadata: JSON.stringify({
        billId: bill.id,
        scheduledDate: date || new Date().toISOString(),
        payeeName,
        accountNumber: data.accountNumber,
        category: data.category || 'UTILITIES',
        source: data.source || (isEinvoice ? 'EINVOICE_PIPELINE' : 'DIRECTORY_PROVIDER')
      })
    }
  });

  revalidatePath('/bills');
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/admin/ebank/bill-services');
  revalidatePath('/admin/transactions');

  return { success: true, bill, reference: ref, transaction };
}

export async function getBillHistory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const accounts = await prisma.account.findMany({ where: { userId: session.user.id } });
  const accountIds = accounts.map(a => a.id);

  const bills = await prisma.bill.findMany({
    where: { accountId: { in: accountIds } },
    include: { payee: true, account: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return bills;
}

export interface BillProvider {
  id: string;
  name: string;
  category: string;
  country: string;
  code?: string;
  description?: string;
  accountNumber?: string;
  isCustom?: boolean;
}

export async function getProviders(): Promise<BillProvider[]> {
  // 1. Fetch real-time service providers from the database (configured by admin or users)
  let dbProviders: BillProvider[] = [];
  try {
    const payees = await prisma.payee.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    dbProviders = payees.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      country: p.country,
      code: p.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, ''),
      description: `Account / Biller ID: ${p.accountNumber}`,
      accountNumber: p.accountNumber,
      isCustom: true,
    }));
  } catch (err) {
    console.error('Failed to load DB payees for providers:', err);
  }

  // 2. Curated baseline directory
  const curatedProviders: BillProvider[] = [
    // USA
    { id: 'us-1', name: 'AT&T Telecommunications', category: 'INTERNET', country: 'usa', code: 'ATT', description: 'Wireless, Fiber & Digital TV' },
    { id: 'us-2', name: 'Verizon Wireless', category: 'INTERNET', country: 'usa', code: 'VRZ', description: 'National Cellular & Broadband' },
    { id: 'us-3', name: 'Consolidated Edison (ConEd)', category: 'UTILITIES', country: 'usa', code: 'CED', description: 'Power, Gas & Electric' },
    { id: 'us-4', name: 'Pacific Gas & Electric (PG&E)', category: 'UTILITIES', country: 'usa', code: 'PGE', description: 'Natural Gas & Electricity' },
    { id: 'us-5', name: 'American Water Works', category: 'WATER', country: 'usa', code: 'AWW', description: 'Municipal Water & Wastewater' },
    { id: 'us-6', name: 'State Farm Insurance', category: 'INSURANCE', country: 'usa', code: 'SFM', description: 'Home, Auto & Life Policies' },
    { id: 'us-7', name: 'Geico Direct Insurance', category: 'INSURANCE', country: 'usa', code: 'GCO', description: 'Vehicle & Property Underwriting' },
    { id: 'us-8', name: 'Duke Energy', category: 'UTILITIES', country: 'usa', code: 'DUK', description: 'Electric Power Services' },
    { id: 'us-9', name: 'Spectrum / Charter', category: 'TV', country: 'usa', code: 'SPC', description: 'Cable TV & High-Speed Internet' },
    { id: 'us-10', name: 'Chase Card Services', category: 'CREDIT', country: 'usa', code: 'JPM', description: 'Revolving Credit Line Settlement' },

    // Canada
    { id: 'ca-1', name: 'Hydro-Québec', category: 'UTILITIES', country: 'canada', code: 'HQB', description: 'Provincial Power & Utilities' },
    { id: 'ca-2', name: 'Rogers Communications', category: 'INTERNET', country: 'canada', code: 'RGR', description: 'Wireless, Broadband & Media' },
    { id: 'ca-3', name: 'Bell Canada', category: 'INTERNET', country: 'canada', code: 'BEL', description: 'National Telecom Rail' },
    { id: 'ca-4', name: 'Enbridge Gas', category: 'UTILITIES', country: 'canada', code: 'ENB', description: 'Natural Gas Distribution' },
    { id: 'ca-5', name: 'Toronto Water', category: 'WATER', country: 'canada', code: 'TWT', description: 'City Water & Sewer Utility' },
    { id: 'ca-6', name: 'Sun Life Assurance', category: 'INSURANCE', country: 'canada', code: 'SLA', description: 'Health & Life Coverage' },

    // United Kingdom
    { id: 'uk-1', name: 'British Gas', category: 'UTILITIES', country: 'uk', code: 'BGS', description: 'Gas & Electricity Utility' },
    { id: 'uk-2', name: 'Thames Water', category: 'WATER', country: 'uk', code: 'THW', description: 'Greater London Water Authority' },
    { id: 'uk-3', name: 'EDF Energy UK', category: 'UTILITIES', country: 'uk', code: 'EDF', description: 'Low-Carbon Electricity & Gas' },
    { id: 'uk-4', name: 'EE / BT Group', category: 'INTERNET', country: 'uk', code: 'EET', description: 'Fibre Broadband & 5G' },
    { id: 'uk-5', name: 'Virgin Media O2', category: 'TV', country: 'uk', code: 'VM2', description: 'Digital Entertainment & Cable' },
    { id: 'uk-6', name: 'Aviva Insurance UK', category: 'INSURANCE', country: 'uk', code: 'AVV', description: 'Commercial & Personal Underwriting' },
    { id: 'uk-7', name: 'HM Revenue & Customs (HMRC)', category: 'EDUCATION', country: 'uk', code: 'HMRC', description: 'Council & Stamp Tax Clearing' },

    // Germany
    { id: 'de-1', name: 'Deutsche Telekom', category: 'INTERNET', country: 'germany', code: 'DTE', description: 'DSL & Mobile Communications' },
    { id: 'de-2', name: 'E.ON Energie Deutschland', category: 'UTILITIES', country: 'germany', code: 'EON', description: 'Strom und Erdgas' },
    { id: 'de-3', name: 'Vattenfall Europe', category: 'UTILITIES', country: 'germany', code: 'VAT', description: 'Städtische Energieversorgung' },
    { id: 'de-4', name: 'Allianz Versicherungs-AG', category: 'INSURANCE', country: 'germany', code: 'ALZ', description: 'Schaden- und Unfallversicherung' },

    // France
    { id: 'fr-1', name: 'EDF (Électricité de France)', category: 'UTILITIES', country: 'france', code: 'EDF-FR', description: 'Énergie & Électricité' },
    { id: 'fr-2', name: 'Engie Solutions', category: 'UTILITIES', country: 'france', code: 'ENG', description: 'Fourniture de Gaz Naturel' },
    { id: 'fr-3', name: 'Orange S.A.', category: 'INTERNET', country: 'france', code: 'ORA', description: 'Fibre Optique & Mobile' },
    { id: 'fr-4', name: 'AXA Assurances', category: 'INSURANCE', country: 'france', code: 'AXA', description: 'Prévoyance & Habitation' },

    // East Asia
    { id: 'ea-1', name: 'Tokyo Electric Power (TEPCO)', category: 'UTILITIES', country: 'east-asia', code: 'TPC', description: 'Kanto Grid Electricity' },
    { id: 'ea-2', name: 'NTT Docomo', category: 'INTERNET', country: 'east-asia', code: 'DCM', description: 'Telecommunications Network' },
    { id: 'ea-3', name: 'KEPCO Korea Electric', category: 'UTILITIES', country: 'east-asia', code: 'KPC', description: 'National Grid Distribution' },

    // West Africa
    { id: 'wa-1', name: 'Eko Electricity Distribution (EKEDC)', category: 'UTILITIES', country: 'west-africa', code: 'EKD', description: 'Lagos Grid Power' },
    { id: 'wa-2', name: 'MTN Communications', category: 'INTERNET', country: 'west-africa', code: 'MTN', description: 'Broadband & Cellular Rail' },
    { id: 'wa-3', name: 'Ghana Water Company', category: 'WATER', country: 'west-africa', code: 'GWC', description: 'National Water Utility' },
  ];

  // DB custom and admin payees take precedence at the top of the directory
  const existingNames = new Set(dbProviders.map((p) => p.name.toLowerCase().trim()));
  const nonDuplicateCurated = curatedProviders.filter((p) => !existingNames.has(p.name.toLowerCase().trim()));

  return [...dbProviders, ...nonDuplicateCurated];
}
