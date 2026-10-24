import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BRAND, PUBLIC_CONTACT } from '@/src/content/facts';

const PRODUCT_SLUGS = [
    'checking',
    'savings',
    'credit-cards',
    'mortgages',
    'personal-loans',
    'auto-loans',
    'business-checking',
    'merchant-services',
    'treasury-management'
];

export async function generateStaticParams() {
    return PRODUCT_SLUGS.map((slug) => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    if (!PRODUCT_SLUGS.includes(slug)) {
        notFound();
    }

    const filePath = path.join(process.cwd(), 'src', 'content', 'products', `${slug}.md`);
    let content = '';

    try {
        content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/{{BRAND\.legalName}}/g, BRAND.shortName);
        content = content.replace(/{{BRAND\.shortName}}/g, BRAND.shortName);
        content = content.replace(/{{BRAND\.domain}}/g, BRAND.domain);
        content = content.replace(/{{BRAND\.phoneDisplay}}/g, PUBLIC_CONTACT.phone);
    } catch (error) {
        // Fallback content if file not created yet
        content = `# Product Information\n\nDetailed information about this product will be available soon. Please check back later or [Contact Us](/contact) for immediate assistance.`;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 animate-fade-in-up">
            <p className="ht-label text-petrol mb-6">Product information</p>
            <div className="ht-prose ht-prose-show-title max-w-3xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}
