import { Database } from './database'
import { App } from './app'
import { ServiceRouting } from './service/service.routes';
(async () => {
  if (!process.env.DB_URI) throw new Error('Database URI is not specified')
  const database = new Database()
  await database.init(process.env.DB_URI)
  const app = new App([
    new ServiceRouting()
  ])
  app.listen(Number(process.env.PORT) || 3000, process.env.LISTEN || '127.0.0.0')
})()
