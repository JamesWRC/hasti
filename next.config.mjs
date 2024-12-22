// tslint:disable-next-line: no-implicit-dependencies
import withMarkdoc from '@markdoc/next.js'
import withSearch from './src/markdoc/search.mjs'
import { fileURLToPath } from 'url';
import path from 'path'

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    appDir: true,
    serverActions: true,
  },
  env: {
    API_URL: process.env.NODE_ENV === 'production' ? 'https://api.hasti.app' : 'http://localhost:3001',
    USER_CONTENT_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@dicebear/converter'] = path.resolve(__dirname, 'node_modules/@dicebear/converter/lib/index.js');
    config.resolve.alias['react-prism'] = path.resolve(__dirname, 'node_modules/react-prism/lib/index.js');
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
  async headers() {
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/:path((?!api/v1/auth).*)', // Matches all paths except `/api/v1/auth`
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, s-maxage=86400, stale-while-revalidate=604800', // Cache for 24 hours, invalidate after a week
            },
          ],
        },
      ];
    }

    return [];
  },
}
//https://github.com/apps/hasti-bot/installations/new?pkg=abc123
//https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
//https://github.com/JamesWRC/pacman-ai-website/blob/master/src/components/sections/loginSignup.js
export default withSearch(
  withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig),
)
