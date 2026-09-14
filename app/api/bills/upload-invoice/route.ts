import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * Invoice OCR endpoint.
 *
 * Real OCR requires a third-party service (AWS Textract, Google Cloud Vision, etc.)
 * which is not integrated. This endpoint returns a 422 so the frontend can
 * fall back to manual amount entry rather than showing random fake data.
 *
 * To enable real OCR: set NEXT_PUBLIC_OCR_PROVIDER and add the integration here.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { message: 'No file uploaded' },
                { status: 400 }
            );
        }

        // OCR not integrated — prompt the user to enter the amount manually
        return NextResponse.json(
            {
                success: false,
                message: 'Automatic invoice scanning is not yet available. Please enter the amount manually.',
                requiresManualEntry: true,
            },
            { status: 422 }
        );
    } catch (error) {
        console.error('Invoice upload error:', error);
        return NextResponse.json(
            { message: 'Failed to process invoice' },
            { status: 500 }
        );
    }
}
