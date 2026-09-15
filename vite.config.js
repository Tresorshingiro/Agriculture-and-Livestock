import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { accessServerPlugin } from './server/vite-plugin.js'

function localHttps() {
  const key = path.resolve('.certs/dev-key.pem')
  const cert = path.resolve('.certs/dev-cert.pem')
  if (!fs.existsSync(key) || !fs.existsSync(cert)) return undefined
  return { key: fs.readFileSync(key), cert: fs.readFileSync(cert) }
}

export default defineConfig(({ mode }) => {
  // Server-side config only. These are NEVER exposed to the browser: they are
  // read by the access server in-process, and carry no VITE_ prefix, so Vite
  // will not inline them into the client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of [
    'PORTAL_URL',
    'PUBLIC_ORIGIN',
    'SESSION_SECRET',
    'PORTAL_CLIENT_ID',
    'PORTAL_CLIENT_SECRET',
  ]) {
    process.env[key] ||= env[key]
  }

  return {
    plugins: [react(), accessServerPlugin()],
    server: { port: 5174, strictPort: true, https: localHttps() },
    preview: { port: 4174, https: localHttps() },
  }
})
