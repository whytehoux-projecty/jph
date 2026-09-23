/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(process.env.DOCKER_BUILD === '1' && { output: 'standalone' }),
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
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
            
            // Application Management redirects
            { source: '/admin/customers/applications', destination: '/admin/customers/application-management/account-applications', permanent: true },
            { source: '/admin/customers/portal-requests', destination: '/admin/customers/application-management/portal-requests', permanent: true },
            
            // Finance redirects
            { source: '/admin/finance/transactions', destination: '/admin/transactions', permanent: true },
            { source: '/admin/finance/accounts', destination: '/admin/customers/account-holders', permanent: true },
            { source: '/admin/finance/cards', destination: '/admin/customers/account-holders', permanent: true },
            { source: '/admin/finance/statements', destination: '/admin/customers/account-holders', permanent: true },
            { source: '/admin/finance/bills', destination: '/admin/ebank/bill-services', permanent: true },
            
            // Communications to e-Bank redirects
            { source: '/admin/communications/notifications', destination: '/admin/ebank/notifications', permanent: true },
            { source: '/admin/communications/support', destination: '/admin/ebank/support', permanent: true },
        ];
    },
};

export default nextConfig;
