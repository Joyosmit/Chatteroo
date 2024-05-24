/** @type {import('next').NextConfig} */
const nextConfig = {
    images:{
        remotePatterns: [
            {hostname: "friendly-orca-765.convex.cloud"}
        ]
    }
};

export default nextConfig;
