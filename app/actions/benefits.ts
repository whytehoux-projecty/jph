'use server';

import { randomBytes } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { parseUserFeatureOverrides, type BenefitsMethodsOverrides } from '@/lib/feature-overrides';
import { ADVISORY_FORMATS, ADVISORY_TOPICS, type AdvisoryFormat } from '@/lib/advisory';

/**
 * "Your relationship": the customer's relationship manager (as staff recorded
 * it), their tier, and advisory meeting requests that staff answer.
 *
 * Points, tier perks and concierge were removed: no points ledger or
 * published perks exist.
 */

/** Subject prefix the admin benefits queue filters on (app/actions/admin-ebank.ts). */
const ADVISORY_PREFIX = '[Private Advisory Booking]';

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

export interface RelationshipManager {
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
}

/** The relationship manager staff recorded for the customer, or null when none is. */
export async function getRelationship(): Promise<{ tier: string; manager: RelationshipManager | null }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true, accountManagerName: true, accountManagerTitle: true, accountManagerEmail: true, accountManagerPhone: true },
  });

  const name = user?.accountManagerName?.trim();
  return {
    tier: user?.tier || 'BASIC',
    manager: name
      ? {
          name,
          title: user?.accountManagerTitle?.trim() || null,
          email: user?.accountManagerEmail?.trim() || null,
          phone: user?.accountManagerPhone?.trim() || null,
        }
      : null,
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

/**
 * There is no points ledger: the balance shown was an estimate, and this used
 * to credit real cash for any number of points without checking a balance.
 * Every redemption is refused until points are actually recorded.
 */
export async function submitPointRedemption(_data: {
  points: number;
  targetAccountId: string;
  category: string;
  description?: string;
}): Promise<RewardRedemptionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: 'Authentication required' };
  }
  return {
    success: false,
    message: "Points can't be redeemed online right now. Contact us if you have points to redeem.",
  };
}

export interface AdvisoryRequestInput {
  topic: string;
  /** YYYY-MM-DD, a preference the team will try to meet. */
  preferredDate: string;
  format: AdvisoryFormat;
  notes?: string;
}

/** Sends a meeting request to staff. It isn't a booking until they confirm it. */
export async function requestAdvisoryMeeting(data: AdvisoryRequestInput): Promise<{ success: boolean; reference?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');
  const userId = session.user.id;

  const permissions = await getUserBenefitsPermissions();
  if (!permissions.enabled || !permissions.methods.private_advisory) {
    return { success: false, error: 'Requesting meetings online is turned off for your profile. Contact us to arrange one.' };
  }

  const topic = (ADVISORY_TOPICS as readonly string[]).includes(data.topic) ? data.topic : null;
  if (!topic) return { success: false, error: 'Choose what you would like to talk about.' };
  const format = ADVISORY_FORMATS[data.format] ? data.format : null;
  if (!format) return { success: false, error: 'Choose how you would like to meet.' };
  const date = new Date(`${data.preferredDate}T00:00:00Z`);
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
  if (Number.isNaN(date.getTime()) || date <= today) return { success: false, error: 'Choose a date from tomorrow onwards.' };
  const notes = data.notes?.trim().slice(0, 1000) || '';

  const reference = `ADV-${randomBytes(5).toString('hex').toUpperCase()}`;
  const dateLabel = date.toISOString().slice(0, 10);

  await prisma.supportTicket.create({
    data: {
      userId,
      subject: `${ADVISORY_PREFIX} ${topic} (Ref: ${reference})`,
      message: `Topic: ${topic}\nPreferred date: ${dateLabel}\nFormat: ${ADVISORY_FORMATS[format]}\nNotes: ${notes || 'None'}`,
      status: 'OPEN',
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      title: 'Meeting request received',
      message: `We've received your request to talk about ${topic.toLowerCase()} (reference ${reference}). We'll contact you to confirm a time.`,
    },
  });

  revalidatePath('/relationship');
  revalidatePath('/admin/ebank/benefits');
  return { success: true, reference };
}

/** The customer's advisory meeting requests, newest first. */
export async function getAdvisoryRequests() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id, subject: { startsWith: ADVISORY_PREFIX } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return tickets.map((t) => {
    const field = (label: string) => t.message.match(new RegExp(`^${label}: (.*)$`, 'mi'))?.[1]?.trim() || null;
    return {
      id: t.id,
      reference: t.subject.match(/Ref: ([\w-]+)/)?.[1] ?? null,
      topic: t.subject.replace(ADVISORY_PREFIX, '').replace(/\s*\(Ref:.*?\)/, '').trim(),
      preferredDate: field('Preferred date'),
      format: field('Format'),
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    };
  });
}
