'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { parseUserFeatureOverrides, type LoanMethodsOverrides } from '@/lib/feature-overrides';

export interface SavingsGoalItem {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
  category?: string;
}

export interface UserLoanPermissions {
  enabled: boolean;
  methods: LoanMethodsOverrides;
}

export async function getUserLoanPermissions(): Promise<UserLoanPermissions> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      enabled: false,
      methods: { auto: false, mortgage: false, personal: false, heloc: false, business: false },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { transferMethodOverrides: true },
  });

  const parsed = parseUserFeatureOverrides(user?.transferMethodOverrides);
  return {
    enabled: parsed.loans.enabled,
    methods: parsed.loans.methods,
  };
}

export interface LoanProduct {
  id: string;
  name: string;
  shortName: string;
  category: 'auto' | 'mortgage' | 'personal' | 'heloc' | 'business';
  headline: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  startingApr: number;
  aprDisplay: string;
  availableTerms: number[]; // in months
  termDisplay: string;
  collateral: string;
  originationFee: string;
  prepaymentPenalty: string;
  highlights: string[];
  requirements: string[];
  icon: string;
  isRestricted?: boolean;
}

export interface LoanApplicationResult {
  success: boolean;
  reference?: string;

  loanType?: string;
  requestedAmount?: number;
  approvedAmount?: number;
  termMonths?: number;
  monthlyPayment?: number;
  interestRate?: number;
  status: 'PRE_APPROVED' | 'SUBMITTED_FOR_UNDERWRITING' | 'REJECTED';
  message: string;
  details?: {
    applicantName: string;
    targetAccount: string;
    estimatedDisbursement: string;
    firstPaymentDate: string;
  };
}

export interface LoanApplicationItem {
  id: string;
  reference: string;
  loanType: string;
  loanName: string;
  amount: number;
  termMonths: number;
  monthlyPayment: number;
  interestRate: number;
  status: 'PRE_APPROVED' | 'SUBMITTED_FOR_UNDERWRITING' | 'ACTIVE' | 'FUNDED';
  submittedAt: string;
  targetAccount: string;
}

// -----------------------------------------------------------------------------
// Backwards Compatibility Functions
// -----------------------------------------------------------------------------

export async function getSavingsGoal() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  let goal = await prisma.savingsGoal.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  if (!goal) {
    goal = await prisma.savingsGoal.create({
      data: {
        userId: session.user.id,
        name: 'Heritage Emergency Vault',
        targetAmount: 25000,
        currentAmount: 5000,
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }
    });
  }

  return goal;
}

export async function updateSavingsGoal(data: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const goal = await prisma.savingsGoal.findFirst({
    where: { userId: session.user.id }
  });

  if (!goal) throw new Error('Not found');

  const updated = await prisma.savingsGoal.update({
    where: { id: goal.id },
    data: {
      name: data.name,
      targetAmount: parseFloat(data.targetAmount),
      targetDate: new Date(data.targetDate)
    }
  });

  revalidatePath('/savings');
  return updated;
}

// -----------------------------------------------------------------------------
// Savings Goals & Plans Management
// -----------------------------------------------------------------------------

export async function getSavingsGoals(): Promise<SavingsGoalItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  if (goals.length === 0) {
    // Seed initial goal for realistic showcase
    const defaultGoal = await prisma.savingsGoal.create({
      data: {
        userId: session.user.id,
        name: 'Heritage Wealth Reserve',
        targetAmount: 50000,
        currentAmount: 18500,
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      }
    });
    return [
      {
        id: defaultGoal.id,
        name: defaultGoal.name,
        targetAmount: defaultGoal.targetAmount,
        currentAmount: defaultGoal.currentAmount,
        targetDate: defaultGoal.targetDate.toISOString(),
        createdAt: defaultGoal.createdAt.toISOString(),
        category: 'Vault Reserve',
      }
    ];
  }

  return goals.map((g) => ({
    id: g.id,
    name: g.name,
    targetAmount: g.targetAmount,
    currentAmount: g.currentAmount,
    targetDate: g.targetDate.toISOString(),
    createdAt: g.createdAt.toISOString(),
  }));
}

export async function createSavingsPlan(data: {
  name: string;
  targetAmount: number;
  initialDeposit?: number;
  targetDate: string;
  category?: string;
  sourceAccountId?: string;
  autoSaveFrequency?: string;
  autoSaveAmount?: number;
}): Promise<{ success: boolean; goal?: SavingsGoalItem; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  try {
    const initialDeposit = data.initialDeposit && data.initialDeposit > 0 ? data.initialDeposit : 0;

    // If initial deposit is requested from an account, verify and deduct
    if (initialDeposit > 0 && data.sourceAccountId) {
      const account = await prisma.account.findUnique({
        where: { id: data.sourceAccountId },
      });

      if (!account || account.userId !== session.user.id) {
        return { success: false, error: 'Source funding account not found' };
      }

      if (account.balance < initialDeposit) {
        return { success: false, error: 'Insufficient funds in source account for initial deposit' };
      }

      // Deduct from account
      await prisma.account.update({
        where: { id: account.id },
        data: { balance: { decrement: initialDeposit } },
      });

      // Record transaction
      await prisma.transaction.create({
        data: {
          accountId: account.id,
          type: 'DEBIT',
          amount: initialDeposit,
          description: `Savings Plan Initial Deposit - ${data.name}`,
          status: 'COMPLETED',
          category: 'SAVINGS',
          transactionType: 'SAVINGS_ALLOCATION',
          methodId: 'savings_plan',
          reference: `SAV-${Date.now().toString().slice(-6)}`,
          metadata: JSON.stringify({
            planName: data.name,
            targetAmount: data.targetAmount,
          }),
        },
      });
    }

    const created = await prisma.savingsGoal.create({
      data: {
        userId: session.user.id,
        name: data.name,
        targetAmount: data.targetAmount,
        currentAmount: initialDeposit,
        targetDate: new Date(data.targetDate),
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'New Savings Plan Created',
        message: `Your savings plan "${data.name}" targeting $${data.targetAmount.toLocaleString()} has been established.`,
      },
    });

    revalidatePath('/savings');
    revalidatePath('/dashboard');

    return {
      success: true,
      goal: {
        id: created.id,
        name: created.name,
        targetAmount: created.targetAmount,
        currentAmount: created.currentAmount,
        targetDate: created.targetDate.toISOString(),
        createdAt: created.createdAt.toISOString(),
        category: data.category || 'General Savings',
      },
    };
  } catch (error: any) {
    console.error('Failed to create savings plan:', error);
    return { success: false, error: error.message || 'Failed to create plan' };
  }
}

export async function depositToSavingsPlan(
  goalId: string,
  amount: number,
  sourceAccountId: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

  if (amount <= 0) return { success: false, error: 'Amount must be greater than zero' };

  try {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: goalId, userId: session.user.id },
    });
    if (!goal) return { success: false, error: 'Savings plan not found' };

    const account = await prisma.account.findUnique({
      where: { id: sourceAccountId },
    });
    if (!account || account.userId !== session.user.id) {
      return { success: false, error: 'Source account not found' };
    }

    if (account.balance < amount) {
      return { success: false, error: 'Insufficient funds in selected account' };
    }

    // Deduct from account
    await prisma.account.update({
      where: { id: account.id },
      data: { balance: { decrement: amount } },
    });

    // Increment savings goal
    const updatedGoal = await prisma.savingsGoal.update({
      where: { id: goal.id },
      data: { currentAmount: { increment: amount } },
    });

    // Record transaction
    await prisma.transaction.create({
      data: {
        accountId: account.id,
        type: 'DEBIT',
        amount: amount,
        description: `Savings Contribution - ${goal.name}`,
        status: 'COMPLETED',
        category: 'SAVINGS',
        transactionType: 'SAVINGS_ALLOCATION',
        methodId: 'savings_plan',
        reference: `SAV-${Date.now().toString().slice(-6)}`,
        metadata: JSON.stringify({
          goalId: goal.id,
          goalName: goal.name,
          progress: Math.min(100, Math.round((updatedGoal.currentAmount / updatedGoal.targetAmount) * 100)),
        }),
      },
    });

    revalidatePath('/savings');
    revalidatePath('/dashboard');

    return { success: true, newBalance: updatedGoal.currentAmount };
  } catch (err: any) {
    return { success: false, error: err.message || 'Deposit failed' };
  }
}

export async function deleteSavingsPlan(goalId: string): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  try {
    await prisma.savingsGoal.deleteMany({
      where: { id: goalId, userId: session.user.id },
    });
    revalidatePath('/savings');
    revalidatePath('/dashboard');
    return { success: true };
  } catch {
    return { success: false };
  }
}

// -----------------------------------------------------------------------------
// Available Loan Products Catalog
// -----------------------------------------------------------------------------

export async function getAvailableLoanProducts(): Promise<LoanProduct[]> {
  return [
    {
      id: 'auto-loan',
      name: 'Auto Loan & Vehicle Refinancing',
      shortName: 'Auto Loan',
      category: 'auto',
      headline: 'Competitive low-rate financing for new, pre-owned, and refinance vehicles.',
      description:
        'Finance your next vehicle or refinance an existing high-interest auto loan with Heritage Trust Bank. Enjoy rate discounts with automated vault payment deduction.',
      minAmount: 5000,
      maxAmount: 150000,
      startingApr: 4.79,
      aprDisplay: 'From 4.79% Fixed APR',
      availableTerms: [24, 36, 48, 60, 72, 84],
      termDisplay: '24 to 84 Months',
      collateral: 'Vehicle Title / Secured Lien',
      originationFee: '$0 (Zero Origination)',
      prepaymentPenalty: 'None ($0 Prepayment)',
      highlights: [
        'Up to 100% Loan-to-Value (LTV) on new vehicles',
        '60-day deferred first payment grace period',
        '0.25% APR autopay discount with Heritage Checking',
        'Quick 15-minute digital pre-qualification'
      ],
      requirements: [
        'Minimum verifiable gross income of $35,000/yr',
        'Valid driver license and vehicle title/VIN details',
        'Proof of comprehensive auto insurance'
      ],
      icon: 'Car',
    },
    {
      id: 'mortgage-loan',
      name: 'Residential & Commercial Mortgage',
      shortName: 'Mortgage Loan',
      category: 'mortgage',
      headline: 'Fixed and adjustable rate home mortgages for primary, secondary, and investment estates.',
      description:
        'Purchase or refinance your estate with transparent terms, locked interest rates, and dedicated institutional concierge mortgage underwriting.',
      minAmount: 50000,
      maxAmount: 2500000,
      startingApr: 5.85,
      aprDisplay: 'From 5.85% Fixed APR',
      availableTerms: [180, 240, 360], // 15, 20, 30 years
      termDisplay: '15, 20, or 30 Years Fixed',
      collateral: 'Real Estate First Deed of Trust',
      originationFee: '0.50% standard (capped)',
      prepaymentPenalty: 'None ($0 Prepayment)',
      highlights: [
        'Conforming & Jumbo mortgage capacity up to $2.5M+',
        '60-day rate lock guarantee during closing',
        'Streamlined digital documentation portal',
        'Dedicated private wealth mortgage advisor'
      ],
      requirements: [
        'Down payment starting at 10% for qualified buyers',
        '2 years of tax returns or audited financials',
        'Standard property appraisal and title clearance'
      ],
      icon: 'Home',
    },
    {
      id: 'personal-loan',
      name: 'Unsecured Personal Credit Line',
      shortName: 'Personal Loan',
      category: 'personal',
      headline: 'Flexible unsecured cash liquidity for debt consolidation, home renovation, or major expenses.',
      description:
        'Borrow with confidence without pledging home or car assets. Funds are deposited directly into your selected Heritage vault account within 24 hours of approval.',
      minAmount: 2000,
      maxAmount: 75000,
      startingApr: 6.49,
      aprDisplay: 'From 6.49% Fixed APR',
      availableTerms: [12, 24, 36, 48, 60],
      termDisplay: '12 to 60 Months',
      collateral: 'None (Unsecured Signature Loan)',
      originationFee: '$0 Zero Origination Fee',
      prepaymentPenalty: 'None ($0 Prepayment)',
      highlights: [
        'Fixed monthly repayment with zero rate escalations',
        'Direct disbursement into your checking account',
        'No collateral or home equity appraisal required',
        'Use for debt payoff, tuition, weddings, or emergency liquidity'
      ],
      requirements: [
        'Established Heritage vault account with positive standing',
        'Credit score of 660 or higher',
        'Proof of employment or verified business cash flow'
      ],
      icon: 'HandCoins',
    },
    {
      id: 'home-equity-loan',
      name: 'Home Equity Loan & HELOC Line',
      shortName: 'Home Equity Loan',
      category: 'heloc',
      headline: 'Leverage your home equity for high-value renovations, liquidity, or investment capital.',
      description:
        'Access a revolving line of credit or lump-sum fixed second mortgage backed by the accumulated equity in your primary residence or secondary luxury property.',
      minAmount: 25000,
      maxAmount: 500000,
      startingApr: 5.45,
      aprDisplay: 'From 5.45% Variable/Fixed APR',
      availableTerms: [60, 120, 180, 240, 360],
      termDisplay: '5 to 30 Years Term / 10-Yr Draw',
      collateral: 'Subordinate Residential Real Estate Lien',
      originationFee: '$0 Annual Fee & No Closing Fees',
      prepaymentPenalty: 'None ($0 Prepayment)',
      highlights: [
        'Borrow up to 85% Combined Loan-to-Value (CLTV)',
        '10-year interest-only draw period followed by fixed amortization',
        'Potential tax advantages (consult your tax advisor)',
        'Access funds instantly via mobile transfer or equity card'
      ],
      requirements: [
        'Minimum $40,000 in accessible real estate equity',
        'Primary or secondary residence located in approved states',
        'Standard automated desktop property valuation'
      ],
      icon: 'Building',
    },
    {
      id: 'business-loan',
      name: 'Commercial Enterprise & Capital Loan',
      shortName: 'Commercial & Business Loan',
      category: 'business',
      headline: 'Institutional capital for working capital, business expansion, and equipment acquisition.',
      description:
        'Empower your company with robust commercial credit facilities structured to meet cyclical inventory needs, capital expenditures, or corporate acquisitions.',
      minAmount: 25000,
      maxAmount: 1000000,
      startingApr: 6.95,
      aprDisplay: 'From 6.95% Fixed APR',
      availableTerms: [12, 24, 36, 60, 120],
      termDisplay: '12 to 120 Months',
      collateral: 'Commercial Assets / UCC-1 Blanket Lien',
      originationFee: '0.75% one-time',
      prepaymentPenalty: 'None after 12 months',
      highlights: [
        'Lines of credit up to $1,000,000 with flexible draw periods',
        'Equipment financing with 100% purchase cost covered',
        'Fast institutional review turnaround within 48 hours',
        'Dedicated Commercial Relationship Banking Officer'
      ],
      requirements: [
        'Business operating for at least 12 months',
        'Annual business revenue in excess of $150,000',
        'Recent corporate bank statements or P&L statements'
      ],
      icon: 'Landmark',
    },
  ];
}

// -----------------------------------------------------------------------------
// User Credit Score
// -----------------------------------------------------------------------------

export async function getUserCreditScore(): Promise<{ score: number; rating: string; change: number }> {
  const session = await auth();
  if (!session?.user?.id) return { score: 752, rating: 'Excellent', change: +8 };

  try {
    const cs = await prisma.creditScore.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (cs) {
      let rating = 'Good';
      if (cs.score >= 750) rating = 'Excellent';
      else if (cs.score >= 700) rating = 'Very Good';
      else if (cs.score >= 650) rating = 'Good';
      else rating = 'Fair';

      return { score: cs.score, rating, change: cs.change || 0 };
    }

    return { score: 752, rating: 'Excellent', change: +8 };
  } catch {
    return { score: 752, rating: 'Excellent', change: +8 };
  }
}

// -----------------------------------------------------------------------------
// Loan Application Submission
// -----------------------------------------------------------------------------

export async function submitLoanApplication(data: {
  loanType: string;
  amount: number;
  termMonths: number;
  monthlyPayment: number;
  purpose: string;
  annualIncome: number;
  employmentStatus?: string;
  targetAccountId: string;
}): Promise<LoanApplicationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, status: 'REJECTED', message: 'Authentication required' };
  }

  // Check customer-level loan permissions set by Admin
  const permissions = await getUserLoanPermissions();
  if (!permissions.enabled) {
    return {
      success: false,
      status: 'REJECTED',
      message: 'Loan application services are currently disabled for your account profile. Please contact your private wealth banker.',
    };
  }

  const methodKey = data.loanType as keyof typeof permissions.methods;
  if (permissions.methods[methodKey] === false) {
    return {
      success: false,
      status: 'REJECTED',
      message: 'This specific loan facility is currently restricted for your account profile.',
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });


    const account = await prisma.account.findUnique({
      where: { id: data.targetAccountId },
    });

    const refNumber = `LN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const products = await getAvailableLoanProducts();
    const product = products.find((p) => p.id === data.loanType) || products[0];

    // Determine pre-approval status based on reasonable underwriting rules
    const isPreApproved = data.amount <= product.maxAmount && data.annualIncome >= 30000;
    const status: 'PRE_APPROVED' | 'SUBMITTED_FOR_UNDERWRITING' = isPreApproved
      ? 'PRE_APPROVED'
      : 'SUBMITTED_FOR_UNDERWRITING';

    // Record notification for user
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: isPreApproved ? 'Loan Pre-Approval Issued' : 'Loan Application Received',
        message: `Your application for ${product.name} (Ref: ${refNumber}) for $${data.amount.toLocaleString()} has been ${
          isPreApproved ? 'pre-approved at ' + product.aprDisplay : 'queued for institutional underwriting'
        }.`,
      },
    });

    // Record in Transaction audit log as pending credit request
    if (account) {
      await prisma.transaction.create({
        data: {
          accountId: account.id,
          type: 'CREDIT',
          amount: data.amount,
          description: `Loan Pre-Approval: ${product.shortName} (${refNumber})`,
          status: 'PENDING',
          category: 'LOAN',
          transactionType: 'LOAN_APPLICATION',
          methodId: product.id,
          reference: refNumber,
          metadata: JSON.stringify({
            loanName: product.name,
            termMonths: data.termMonths,
            monthlyPayment: data.monthlyPayment,
            apr: product.startingApr,
            purpose: data.purpose,
            annualIncome: data.annualIncome,
            status: status,
          }),
        },
      });
    }

    revalidatePath('/savings');

    const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Heritage Vault Client';

    return {
      success: true,
      reference: refNumber,
      loanType: product.name,
      requestedAmount: data.amount,
      approvedAmount: data.amount,
      termMonths: data.termMonths,
      monthlyPayment: data.monthlyPayment,
      interestRate: product.startingApr,
      status: status,
      message: isPreApproved
        ? `Congratulations! You have been pre-approved for $${data.amount.toLocaleString()} at ${product.startingApr}% APR.`
        : `Your application has been received and routed to an Underwriting Specialist. Ref: ${refNumber}.`,
      details: {
        applicantName: fullName,
        targetAccount: account ? `${account.accountType} (••••${account.accountNumber.slice(-4)})` : 'Primary Vault',
        estimatedDisbursement: 'Within 24 to 48 business hours',
        firstPaymentDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      },
    };
  } catch (err: any) {
    console.error('Error submitting loan application:', err);
    return {
      success: false,
      status: 'REJECTED',
      message: err.message || 'Failed to submit loan application.',
    };
  }
}

// -----------------------------------------------------------------------------
// Recent Loan Applications
// -----------------------------------------------------------------------------

export async function getRecentLoanApplications(): Promise<LoanApplicationItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const loanTxs = await prisma.transaction.findMany({
      where: {
        account: {
          userId: session.user.id,
        },
        category: 'LOAN',
      },
      include: {
        account: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (loanTxs.length === 0) {
      // Seed a sample pre-approved record for demonstration
      return [
        {
          id: 'demo-loan-1',
          reference: 'LN-2026-881924',
          loanType: 'personal-loan',
          loanName: 'Unsecured Personal Credit Line',
          amount: 25000,
          termMonths: 36,
          monthlyPayment: 766.18,
          interestRate: 6.49,
          status: 'PRE_APPROVED',
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          targetAccount: 'Checking ••••4821',
        },
      ];
    }

    return loanTxs.map((tx) => {
      let meta: any = {};
      try {
        meta = tx.metadata ? JSON.parse(tx.metadata) : {};
      } catch {
        meta = {};
      }
      return {
        id: tx.id,
        reference: tx.reference || `LN-${tx.id.slice(0, 8)}`,
        loanType: tx.methodId || 'personal-loan',
        loanName: meta.loanName || 'Institutional Loan Facility',
        amount: tx.amount,
        termMonths: meta.termMonths || 36,
        monthlyPayment: meta.monthlyPayment || 0,
        interestRate: meta.apr || 5.99,
        status: (meta.status as any) || 'PRE_APPROVED',
        submittedAt: tx.createdAt.toISOString(),
        targetAccount: tx.account ? `${tx.account.accountType} ••••${tx.account.accountNumber.slice(-4)}` : 'Vault',
      };
    });
  } catch {
    return [];
  }
}
