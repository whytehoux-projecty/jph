import { NextResponse } from 'next/server';

export const runtime = 'edge';

// In-memory store for savings goals (resets on server restart)
let savingsGoal = {
    targetAmount: 25000,
    currentAmount: 18450,
    name: 'New House Fund',
    targetDate: '2026-12-31'
};

export async function GET() {
    return NextResponse.json(savingsGoal);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Validation
        if (!body.targetAmount || !body.name) {
            return NextResponse.json(
                { message: 'Target amount and name are required' },
                { status: 400 }
            );
        }

        savingsGoal = {
            ...savingsGoal,
            ...body,
            currentAmount: savingsGoal.currentAmount // Preserve current amount for now
        };

        return NextResponse.json(savingsGoal);
    } catch (error) {
        return NextResponse.json(
            { message: 'Invalid request' },
            { status: 400 }
        );
    }
}
