import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BRAND } from '@/src/content/facts';

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
        content = content.replace(/{{BRAND\.legalName}}/g, BRAND.legalName);
        content = content.replace(/{{BRAND\.shortName}}/g, BRAND.shortName);
        content = content.replace(/{{BRAND\.domain}}/g, BRAND.domain);
        content = content.replace(/{{BRAND\.phoneDisplay}}/g, BRAND.phoneDisplay);
    } catch (error) {
        // Fallback content if file not created yet
        content = `# Product Information\n\nDetailed information about this product will be available soon. Please check back later or [Contact Us](/contact) for immediate assistance.`;
    }

    return (
        <main className="min-h-screen bg-paper-100 py-16 sm:py-24 animate-fade-in-up">
            <div className="max-w-3xl mx-auto px-6">
                <div className="mb-12">
                    <div className="h-1 w-12 bg-pine-600 rounded mb-4"></div>
                </div>

                <div className="prose prose-ink max-w-none prose-headings:font-display prose-headings:text-ink-900 prose-p:text-body prose-p:text-ink-700 prose-a:text-vermilion-600 prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </main>
    );
}
