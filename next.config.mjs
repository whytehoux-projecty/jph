/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(process.env.DOCKER_BUILD === '1' && { output: 'standalone' }),
    serverActions: {
        bodySizeLimit: '10mb',
    },
    images: {
        unoptimized: true,
    },
    async redirects() {
        return [
            // Old generic redirects
            { source: '/admin/users', destination: '/admin/customers/account-holders', permanent: true },
            { source: '/admin/applications', destination: '/admin/customers/application-management/account-applications', permanent: true },
            { source: '/admin/requests', destination: '/admin/customers/application-management/portal-requests', permanent: true },
            { source: '/admin/transactions', destination: '/admin/transactions', permanent: true },
            
            // Phase 2: Application Management redirects
            { source: '/admin/customers/applications', destination: '/admin/customers/application-management/account-applications', permanent: true },
            { source: '/admin/customers/portal-requests', destination: '/admin/customers/application-management/portal-requests', permanent: true },
            
            // Phase 3 & 6: Finance & Txns redirects
            { source: '/admin/finance/transactions', destination: '/admin/transactions', permanent: true },
            { source: '/admin/finance/accounts', destination: '/admin/customers/account-holders', permanent: true },
            { source: '/admin/finance/cards', destination: '/admin/customers/account-holders', permanent: true },
            { source: '/admin/finance/statements', destination: '/admin/customers/account-holders', permanent: true },
            
            // Phase 4: e-Bank redirects
            { source: '/admin/communications/notifications', destination: '/admin/ebank/notifications', permanent: true },
            { source: '/admin/communications/support', destination: '/admin/ebank/support', permanent: true },
            { source: '/admin/finance/bills', destination: '/admin/transactions', permanent: true }, // or somewhere else if needed, but the user wants bill services setup in e-bank and bills tx in transactions. Wait, I'll redirect to transactions.
        ];
    },
};

export default nextConfig;
