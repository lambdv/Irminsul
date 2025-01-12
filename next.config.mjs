/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        dynamicIO: true,
    },
    images: {
        domains: ['www.irminsul.moe'],
    },
    env: {
        GOOGLE_ADSENSE_ACCOUNT: 'ca-pub-1739492299738628',
    },
};

export default nextConfig;