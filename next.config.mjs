/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        // dynamicIO: true,
    },
    images: {
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
                hostname: '64.media.tumblr.com'
            },
            {
                protocol: 'https',
                hostname: 'hoyolab.com'
            }
        ]
    }
};

export default nextConfig;