import type { Metadata } from 'next';
import { AccountFinder } from './AccountFinder';

export const metadata: Metadata = {
    title: 'Account Finder',
    description:
        'Five questions, about a minute: see which Heritage Trust account fits, what it costs, what you will need and who you would speak to.',
};

export default function AccountFinderPage() {
    return <AccountFinder />;
}
