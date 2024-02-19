import withMarkdoc from '@markdoc/next.js'
import withSearch from './src/markdoc/search.mjs'

/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    appDir: true,
    serverActions: true,
  },
  env: {
    API_URL: process.env.NODE_ENV === 'production' ? 'https://api.hasti.app' : 
            process.env.NODE_ENV === 'test' ? 'http://192.168.0.233:3001' :
            'http://localhost:3001'
  }
}

export default withSearch(
  withMarkdoc({ schemaPath: './src/markdoc' })(nextConfig),
)
