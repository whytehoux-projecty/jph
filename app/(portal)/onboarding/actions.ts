'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function completeOnboarding(data: {
    password: string;
    transactionPin: string;
    cryptoWalletEnabled: boolean;
}) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const userId = session.user.id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    if (!user.isFirstLogin) {
        throw new Error("User has already completed onboarding");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Update user profile
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
            transactionPin: data.transactionPin, // Should hash PIN in real-world, leaving plain for ease if needed or hash it. Actually, better hash it.
            pinSetupComplete: true,
            isFirstLogin: false,
            temporaryPassword: null,
            cryptoWalletEnabled: data.cryptoWalletEnabled,
        }
    });

    // Hash the PIN
    const hashedPin = await bcrypt.hash(data.transactionPin, 10);
    await prisma.user.update({
        where: { id: userId },
        data: {
            transactionPin: hashedPin,
        }
    });

    // Create CryptoWallets if opted in
    if (data.cryptoWalletEnabled) {
        // Only create if they don't already have them
        const existingWallets = await prisma.cryptoWallet.findMany({ where: { userId } });
        if (existingWallets.length === 0) {
            await prisma.cryptoWallet.createMany({
                data: [
                    {
                        userId,
                        currency: 'USDC',
                        balance: 0.00,
                        address: `0xUSDC${Math.random().toString(36).substring(2, 12).toUpperCase()}`
                    },
                    {
                        userId,
                        currency: 'USDT',
                        balance: 0.00,
                        address: `0xUSDT${Math.random().toString(36).substring(2, 12).toUpperCase()}`
                    }
                ]
            });
        }
    }

    return { success: true };
}
