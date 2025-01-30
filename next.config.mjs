/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // dynamicIO: true,
    },
    images: {
        // domains: ['cdn.discordapp.com', 'avatars.githubusercontent.com', 'nerdhida.netlify.app', 'genshindata.vercel.app'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.discordapp.com'
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com'
            },
            {
                protocol: 'https',
                hostname: 'nerdhida.netlify.app'
            },
            {
                protocol: 'https',
                hostname: 'genshindata.vercel.app'
            },
            {
                protocol: 'https',
                hostname: 'upload.wikimedia.org'
            }
        ]
    }
};

export default nextConfig;