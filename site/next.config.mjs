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
    API_URL: process.env.NODE_ENV === 'production' ? 'https://api.hasti.app' : 'http://localhost:3001'
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['@dicebear/converter'] = path.resolve(__dirname, 'node_modules/@dicebear/converter/lib/index.js');
    
    return config;
  }
}
//https://github.com/apps/hasti-bot/installations/new?pkg=abc123
//https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
//https://github.com/JamesWRC/pacman-ai-website/blob/master/src/components/sections/loginSignup.js
export default withSearch(
  withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig),
)
