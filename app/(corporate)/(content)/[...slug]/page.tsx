import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BRAND } from '@/src/content/facts';

// List of allowed slugs to prevent directory traversal
const ALLOWED_SLUGS = [
    'security',
    'help',
    'locations',
    'rates-and-fees',
    'accessibility',
    'careers',
    'press',
    'investors'
];

export async function generateStaticParams() {
    return ALLOWED_SLUGS.map((slug) => ({ slug: [slug] }));
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const pageSlug = slug[0];

    if (!ALLOWED_SLUGS.includes(pageSlug) || slug.length > 1) {
        notFound();
    }

    const filePath = path.join(process.cwd(), 'src', 'content', 'pages', `${pageSlug}.md`);
    let content = '';

    try {
        content = fs.readFileSync(filePath, 'utf8');
        // Replace dynamic brand variables in markdown
        content = content.replace(/{{BRAND\.legalName}}/g, BRAND.legalName);
        content = content.replace(/{{BRAND\.shortName}}/g, BRAND.shortName);
        content = content.replace(/{{BRAND\.domain}}/g, BRAND.domain);
        content = content.replace(/{{BRAND\.phone}}/g, BRAND.phoneDisplay);
    } catch (error) {
        console.error(`Missing markdown file for slug: ${pageSlug}`);
        notFound();
    }

    const titleMap: Record<string, string> = {
        'security': 'Security Center',
        'help': 'Help & Support',
        'locations': 'Branches & ATMs',
        'rates-and-fees': 'Rates & Fees',
        'accessibility': 'Accessibility Statement',
        'careers': 'Careers',
        'press': 'Press Room',
        'investors': 'Investor Relations'
    };

    return (
        <main className="min-h-screen bg-paper-100 py-16 sm:py-24">
            <div className="max-w-3xl mx-auto px-6">
                <div className="mb-12">
                    <h1 className="font-display text-display-sm text-ink-900 mb-4">{titleMap[pageSlug] || 'Information'}</h1>
                    <div className="h-1 w-12 bg-vermilion-600 rounded"></div>
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
