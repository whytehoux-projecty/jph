'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { parseUserFeatureOverrides, type BenefitsMethodsOverrides } from '@/lib/feature-overrides';

export interface UserBenefitsPermissions {
  enabled: boolean;
  methods: BenefitsMethodsOverrides;
}

export async function getUserBenefitsPermissions(): Promise<UserBenefitsPermissions> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      enabled: false,
      methods: {
        points_redemption: false,
        relationship_tiers: false,
        private_advisory: false,
        concierge: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { transferMethodOverrides: true },
  });

  const parsed = parseUserFeatureOverrides(user?.transferMethodOverrides);
  return {
    enabled: parsed.benefits.enabled,
    methods: parsed.benefits.methods,
  };
}

export interface UserRewardsData {
  pointsBalance: number;
  cashEquivalent: number;
  pendingPoints: number;
  lifetimeEarned: number;
  tier: string;
  tierName: string;
  pointsRate: string;
  permissions?: UserBenefitsPermissions;
  relationshipDirector: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
}


export interface RewardRedemptionResult {
  success: boolean;
  reference?: string;
  cashAmount?: number;
  pointsRedeemed?: number;
  newPointsBalance?: number;
  targetAccountName?: string;
  message?: string;
}

export interface AdvisoryBookingResult {
  success: boolean;
  reference?: string;
  topic?: string;
  preferredDate?: string;
  format?: string;
  message?: string;
}

export interface BenefitActivityItem {
  id: string;
  reference: string;
  title: string;
  type: 'REDEMPTION' | 'ADVISORY' | 'CONCIERGE' | 'PERK_ACQUISITION';
  value: string;
  date: string;
  status: 'COMPLETED' | 'CONFIRMED' | 'IN_REVIEW' | 'ACTIVE';
}

export async function getUserRewardsData(): Promise<UserRewardsData> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      pointsBalance: 142500,
      cashEquivalent: 1425,
      pendingPoints: 12400,
      lifetimeEarned: 385000,
      tier: 'WORLD_ELITE',
      tierName: 'World Elite Private Vault',
      pointsRate: '3x Dining & Travel • 2x Business • 1.5x Vault Assets',
      relationshipDirector: {
        name: 'Lord Sterling Vance',
        title: 'Senior Managing Wealth Director',
        email: 'sterling.vance@heritagetrust.com',
        phone: '+1 (800) 849-2910 ext. 401',
      },
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        accounts: true,
      },
    });

    const totalVaultBalance = user?.accounts.reduce((sum, a) => sum + (a.balance || 0), 0) || 0;
    // Calculate realistic relationship points based on total relationship assets
    const calculatedPoints = Math.max(85000, Math.round(totalVaultBalance * 0.15));

    const tierNameMap: Record<string, string> = {
      BASIC: 'Standard Vault Member',
      PREMIER: 'Premier Heritage Client',
      PRIVATE_VAULT: 'Private Vault Syndicate',
      WORLD_ELITE: 'World Elite Private Wealth',
    };

    const permissions = await getUserBenefitsPermissions();

    return {
      pointsBalance: calculatedPoints,
      cashEquivalent: calculatedPoints / 100,
      pendingPoints: 12400,
      lifetimeEarned: calculatedPoints + 245000,
      tier: user?.tier || 'WORLD_ELITE',
      tierName: tierNameMap[user?.tier || 'WORLD_ELITE'] || 'World Elite Private Wealth',
      pointsRate: '3x Dining & Travel • 2x Business • 1.5x Vault Assets',
      permissions,
      relationshipDirector: {
        name: user?.accountManagerName || 'Lord Sterling Vance',
        title: user?.accountManagerTitle || 'Senior Managing Wealth Director',
        email: user?.accountManagerEmail || 'wealth.director@heritagetrust.com',
        phone: user?.accountManagerPhone || '+1 (800) 849-2910 ext. 401',
      },
    };
  } catch {
    return {
      pointsBalance: 142500,
      cashEquivalent: 1425,
      pendingPoints: 12400,
      lifetimeEarned: 385000,
      tier: 'WORLD_ELITE',
      tierName: 'World Elite Private Wealth',
      pointsRate: '3x Dining & Travel • 2x Business • 1.5x Vault Assets',
      relationshipDirector: {
        name: 'Lord Sterling Vance',
        title: 'Senior Managing Wealth Director',
        email: 'sterling.vance@heritagetrust.com',
        phone: '+1 (800) 849-2910 ext. 401',
      },
    };
  }
}

export async function submitPointRedemption(data: {
  points: number;
  targetAccountId: string;
  category: string;
  description?: string;
}): Promise<RewardRedemptionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Authentication required' };
  }

  // Check customer-level benefits permissions set by Admin
  const permissions = await getUserBenefitsPermissions();
  if (!permissions.enabled) {
    return {
      success: false,
      message: 'Benefits and rewards redemption is currently disabled for your account profile.',
    };
  }
  if (!permissions.methods.points_redemption) {
    return {
      success: false,
      message: 'Points cash redemption is currently restricted for your account profile.',
    };
  }

  if (data.points <= 0) {
    return { success: false, message: 'Please enter points greater than zero' };
  }


  try {
    const account = await prisma.account.findUnique({
      where: { id: data.targetAccountId },
    });

    if (!account || account.userId !== session.user.id) {
      return { success: false, message: 'Target credit account not found' };
    }

    const cashAmount = Math.round((data.points / 100) * 100) / 100;
    const refNumber = `RWD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Credit destination account
    await prisma.account.update({
      where: { id: account.id },
      data: { balance: { increment: cashAmount } },
    });

    // Create completed credit transaction
    await prisma.transaction.create({
      data: {
        accountId: account.id,
        type: 'CREDIT',
        amount: cashAmount,
        currency: account.currency || 'USD',
        status: 'APPROVED',
        category: 'REWARDS',
        transactionType: 'REWARD_REDEMPTION',
        methodId: 'points_redemption',
        description: `Rewards Point Redemption (${data.points.toLocaleString()} pts) - ${data.category}`,
        reference: refNumber,
        metadata: JSON.stringify({
          pointsRedeemed: data.points,
          conversionRate: '0.01 USD/point',
          category: data.category,
        }),
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Rewards Points Redeemed',
        message: `Successfully converted ${data.points.toLocaleString()} points into $${cashAmount.toLocaleString()} credited to ${account.accountType} (••••${account.accountNumber.slice(-4)}).`,
      },
    });

    revalidatePath('/benefits');
    revalidatePath('/dashboard');

    return {
      success: true,
      reference: refNumber,
      cashAmount,
      pointsRedeemed: data.points,
      targetAccountName: `${account.accountType} ••••${account.accountNumber.slice(-4)}`,
      message: `Successfully credited $${cashAmount.toLocaleString()} to your vault account.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to process points redemption.',
    };
  }
}

export async function requestAdvisorySession(data: {
  topic: string;
  preferredDate: string;
  format: string;
  notes?: string;
}): Promise<AdvisoryBookingResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Authentication required' };
  }

  const permissions = await getUserBenefitsPermissions();
  if (!permissions.enabled) {
    return {
      success: false,
      message: 'Benefits and private advisory services are currently disabled for your account profile.',
    };
  }
  if (!permissions.methods.private_advisory) {
    return {
      success: false,
      message: 'Private advisory bookings are currently restricted for your account profile.',
    };
  }

  try {
    const refNumber = `ADV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject: `[Private Advisory Booking] ${data.topic} (Ref: ${refNumber})`,
        message: `Topic: ${data.topic}\nPreferred Date: ${data.preferredDate}\nFormat: ${data.format}\nClient Notes: ${data.notes || 'No additional notes provided.'}`,
        status: 'OPEN',
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Private Advisory Session Scheduled',
        message: `Your fiduciary consultation for "${data.topic}" on ${data.preferredDate} has been confirmed. Ref: ${refNumber}.`,
      },
    });

    revalidatePath('/benefits');

    return {
      success: true,
      reference: refNumber,
      topic: data.topic,
      preferredDate: data.preferredDate,
      format: data.format,
      message: 'Consultation request submitted. Your Senior Wealth Director will contact you within 24 hours.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to schedule advisory consultation.',
    };
  }
}

export async function requestConciergeBooking(data: {
  serviceType: string;
  requestDetails: string;
  targetDate: string;
  guestsCount?: number;
}): Promise<AdvisoryBookingResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Authentication required' };
  }

  const permissions = await getUserBenefitsPermissions();
  if (!permissions.enabled) {
    return {
      success: false,
      message: 'Benefits and lifestyle concierge services are currently disabled for your account profile.',
    };
  }
  if (!permissions.methods.concierge) {
    return {
      success: false,
      message: '24/7 Lifestyle concierge requests are currently restricted for your account profile.',
    };
  }

  try {

    const refNumber = `CCG-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        subject: `[Lifestyle Concierge Request] ${data.serviceType} (Ref: ${refNumber})`,
        message: `Service: ${data.serviceType}\nTarget Date: ${data.targetDate}\nParty Size: ${data.guestsCount || 2}\nDetails: ${data.requestDetails}`,
        status: 'OPEN',
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: 'Concierge Request Dispatched',
        message: `Your concierge request for "${data.serviceType}" (Ref: ${refNumber}) is being arranged by the Global Hospitality Desk.`,
      },
    });

    revalidatePath('/benefits');

    return {
      success: true,
      reference: refNumber,
      topic: data.serviceType,
      preferredDate: data.targetDate,
      message: 'Concierge request dispatched to the 24/7 Global Hospitality Desk.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to dispatch concierge request.',
    };
  }
}

export async function getRecentBenefitActivities(): Promise<BenefitActivityItem[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [
      {
        id: 'demo-act-1',
        reference: 'RWD-2026-928172',
        title: 'Points Statement Credit (25,000 pts)',
        type: 'REDEMPTION',
        value: '+$250.00 USD',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'COMPLETED',
      },
      {
        id: 'demo-act-2',
        reference: 'ADV-2026-449102',
        title: 'Fiduciary Estate & Trust Planning Consultation',
        type: 'ADVISORY',
        value: 'VIP Confirmed',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
      },
      {
        id: 'demo-act-3',
        reference: 'CCG-2026-192847',
        title: 'Priority Pass™ Prestige Card Renewal & VIP Access',
        type: 'PERK_ACQUISITION',
        value: 'Unlimited Access',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
      },
    ];
  }

  try {
    const [rewardTxs, tickets] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          account: { userId: session.user.id },
          category: 'REWARDS',
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.supportTicket.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { subject: { contains: 'Advisory' } },
            { subject: { contains: 'Concierge' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const items: BenefitActivityItem[] = [];

    rewardTxs.forEach((tx) => {
      items.push({
        id: tx.id,
        reference: tx.reference || `RWD-${tx.id.slice(0, 6)}`,
        title: tx.description,
        type: 'REDEMPTION',
        value: `+$${tx.amount.toLocaleString()}`,
        date: tx.createdAt.toISOString(),
        status: 'COMPLETED',
      });
    });

    tickets.forEach((t) => {
      const isConcierge = t.subject.includes('Concierge');
      items.push({
        id: t.id,
        reference: t.subject.match(/Ref: ([\w-]+)/)?.[1] || `SRV-${t.id.slice(0, 6)}`,
        title: t.subject.replace(/\[.*?\]\s*/, '').replace(/\s*\(Ref:.*?\)/, ''),
        type: isConcierge ? 'CONCIERGE' : 'ADVISORY',
        value: t.status === 'RESOLVED' ? 'Completed' : 'Confirmed',
        date: t.createdAt.toISOString(),
        status: t.status === 'RESOLVED' ? 'COMPLETED' : 'CONFIRMED',
      });
    });

    if (items.length === 0) {
      return [
        {
          id: 'demo-act-1',
          reference: 'RWD-2026-928172',
          title: 'Points Statement Credit (25,000 pts)',
          type: 'REDEMPTION',
          value: '+$250.00 USD',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'COMPLETED',
        },
        {
          id: 'demo-act-2',
          reference: 'ADV-2026-449102',
          title: 'Fiduciary Estate & Trust Planning Consultation',
          type: 'ADVISORY',
          value: 'VIP Confirmed',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'CONFIRMED',
        },
        {
          id: 'demo-act-3',
          reference: 'CCG-2026-192847',
          title: 'Priority Pass™ Prestige Card Renewal & VIP Access',
          type: 'PERK_ACQUISITION',
          value: 'Unlimited Access',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE',
        },
      ];
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}
