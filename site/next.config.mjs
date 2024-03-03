// tslint:disable-next-line: no-implicit-dependencies
import withMarkdoc from '@markdoc/next.js'
import withSearch from './src/markdoc/search.mjs'

/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    appDir: true,
    serverActions: true,
  },
  env: {
    API_URL: process.env.NODE_ENV === 'production' ? 'https://api.hasti.app' : 'http://localhost:3001'
  },
}
//https://github.com/apps/hasti-bot/installations/new?pkg=abc123
//https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
//https://github.com/JamesWRC/pacman-ai-website/blob/master/src/components/sections/loginSignup.js
export default withSearch(
  withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig),
)
