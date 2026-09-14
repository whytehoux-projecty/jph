/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(process.env.DOCKER_BUILD === '1' && { output: 'standalone' }),
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
