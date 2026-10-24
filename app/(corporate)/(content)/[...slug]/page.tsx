import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BRAND, PUBLIC_CONTACT } from '@/src/content/facts';
import { ROUTES } from '@/lib/constants';
import { PageHero } from '@/components/commercial-ui/Isobath';

// List of allowed slugs to prevent directory traversal
// 'security' and 'rates-and-fees' now have their own pages (app/(corporate)/security,
// app/(corporate)/rates-and-fees) built from the Isobath components.
const ALLOWED_SLUGS = [
    'help',
    'locations',
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
        // The page hero carries the one h1, so drop the markdown's own title line
        content = content.replace(/^#\s+.*(\r?\n)+/, '');
        // Replace dynamic brand variables in markdown
        content = content.replace(/{{BRAND\.legalName}}/g, BRAND.shortName);
        content = content.replace(/{{BRAND\.shortName}}/g, BRAND.shortName);
        content = content.replace(/{{BRAND\.domain}}/g, BRAND.domain);
        content = content.replace(/{{BRAND\.phone}}/g, PUBLIC_CONTACT.phone);
        content = content.replace(/{{BRAND\.address}}/g, PUBLIC_CONTACT.address);
    } catch (error) {
        console.error(`Missing markdown file for slug: ${pageSlug}`);
        notFound();
    }

    const titleMap: Record<string, string> = {
        'help': 'Help and support',
        'locations': 'Branches and ATMs',
        'accessibility': 'Accessibility statement',
        'careers': 'Careers',
        'press': 'Press room',
        'investors': 'Investor relations'
    };

    const leadMap: Record<string, string> = {
        'help': 'Answers to the questions we are asked most, and how to reach a person.',
        'locations': 'Where to find us, and when we are open.',
        'accessibility': 'How we make this site and Heritage Vault usable for everyone, and how to tell us when we fall short.',
        'careers': 'Working at Heritage Trust.',
        'press': 'News and statements from Heritage Trust.',
        'investors': 'Reports and information for investors.',
    };

    const title = titleMap[pageSlug] || 'Information';

    return (
        <>
            <PageHero
                label={title}
                title={title}
                lead={leadMap[pageSlug] ?? ''}
                breadcrumb={[
                    { href: ROUTES.home, label: 'Home' },
                    { href: `/${pageSlug}`, label: title },
                ]}
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="ht-prose max-w-3xl">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </>
    );
}
