/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
      if (isServer) {
        config.externals.push('pdf-parse'); // <-- Tell Next.js not to bundle pdf-parse
      }
      return config;
    },
  };
  
  export default nextConfig;
  