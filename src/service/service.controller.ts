import { ServiceModel } from './service.model'
import randomatic from 'randomatic'
import { join, resolve } from 'path'
import { mkdir, writeFile } from 'fs/promises'
import generateKeypair from '../common/functions/generate-keypair.function'
import { CreateServiceInput } from './service.inputs'
import { hash } from 'argon2'

export class ServiceController {
  public static queryServices = async () => {
    return await ServiceModel.find()
  }

  public static createService = async (service: CreateServiceInput) => {
    const [prefix, key] = [this.getUniquePrefix(), randomatic('Aa00!!', 32)]
    const apiKey = `${prefix}.${key}`
    const hashedKey = await hash(key)
    const s = await ServiceModel.create({ ...service, apiKey: { prefix, key: hashedKey } })
    if (!s) throw new Error('Failed to create a new service due to an unexpected server error')
    const passphrase = randomatic('Aa00!!', 16)
    const { publicKey, privateKey } = await generateKeypair(passphrase)
    const path = join(resolve(process.cwd()), 'keys', 'test')
    await mkdir(path, { recursive: true })
    await writeFile(join(path, 'private.pem'), privateKey)
    await writeFile(join(path, 'public.pem'), publicKey)
    await writeFile(join(path, '.env'), `KEY_PASSPHRASE=${passphrase}\nAUTH_API_KEY=${apiKey}`)
    return { _id: s._id, apiKey, passphrase, publicKey }
  }

  private static getUniquePrefix = async () => {
    const prefixes = (await ServiceModel.find()).map(s => s.apiKey.prefix)
    let prefix = randomatic('Aa0', 7)
    while (prefixes.some(p => p === prefix)) prefix = randomatic('Aa0', 7)
    return prefix
  }

  public static findServiceByPrefix = async (prefix: string) => {
    return await ServiceModel.findOne({ 'apiKey.prefix': prefix })
  }
}
