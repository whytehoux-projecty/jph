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
            { source: '/admin/users', destination: '/admin/customers/account-holders', permanent: true },
            { source: '/admin/applications', destination: '/admin/customers/applications', permanent: true },
            { source: '/admin/requests', destination: '/admin/customers/portal-requests', permanent: true },
            { source: '/admin/transactions', destination: '/admin/finance/transactions', permanent: true },
            { source: '/admin/accounts', destination: '/admin/finance/accounts', permanent: true },
            { source: '/admin/cards', destination: '/admin/finance/cards', permanent: true },
            { source: '/admin/bills', destination: '/admin/finance/bills', permanent: true },
            { source: '/admin/statements', destination: '/admin/finance/statements', permanent: true },
            { source: '/admin/notifications', destination: '/admin/communications/notifications', permanent: true },
            { source: '/admin/support', destination: '/admin/communications/support', permanent: true },
        ];
    },
};

export default nextConfig;
