import { createAccessMiddleware } from './access-server.js'

/**
 * Mounts the access server inside Vite for `npm run dev` and `npm run preview`.
 * Production is served by `server/index.js`, which mounts the same middleware
 * in front of the built `dist/` — so the API exists in every environment, not
 * just in development.
 */
export function accessServerPlugin() {
  const middleware = createAccessMiddleware()
  return {
    name: 'rsa-agri-access-server',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}
