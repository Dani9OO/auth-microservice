import validateEnvironment from './common/functions/validate-environment'

import { Database } from './database'
import { App } from './app'
import { Mailer } from './common/mailer'

import { ModuleRouting } from './module/module.routes'
import { PermissionRouting } from './permissions/permission.routes'
import { PolicyRouting } from './policy/policy.routes'
import { RoleRouting } from './role/role.routes'
import { ServiceRouting } from './service/service.routes'
import { UserRouting } from './user/user.routes'

(async () => {
  const env = validateEnvironment()

  const database = new Database()
  await database.init(env.db.uri)

  const mailer = new Mailer(env.smtp.host, env.smtp.port, { user: env.smtp.user, password: env.smtp.pass })
  await mailer.verify()

  const mod = new ModuleRouting()
  const permission = new PermissionRouting()
  const policy = new PolicyRouting()
  const role = new RoleRouting()
  const service = new ServiceRouting()
  const user = new UserRouting()

  const app = new App([
    mod,
    permission,
    policy,
    role,
    service,
    user
  ])

  app.listen(Number(process.env.PORT) || 3000, process.env.LISTEN || '127.0.0.0')
})()
