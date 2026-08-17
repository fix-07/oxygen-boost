import { app } from './app.js'
import { config } from './config.js'
import { connectDb, disconnectDb } from './db.js'

await connectDb()

const server = app.listen(config.port, () => {
  console.log(`[server] يعمل على المنفذ ${config.port} — البيئة: ${config.isProd ? 'production' : 'development'}`)
})

/* إغلاق نظيف حتى لا تُقطع الطلبات الجارية وتُغلق اتصال قاعدة البيانات بسلام */
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(async () => {
      await disconnectDb()
      process.exit(0)
    })
  })
}
