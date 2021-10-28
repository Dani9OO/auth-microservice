import { spawn } from 'child_process'
import { mkdir, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import randomatic from 'randomatic'

export class OpenSSLKeyPair {
  private name: string

  private path: string

  private passphrase?: string;

  constructor (name: string) {
    this.name = name
    this.path = join(resolve(process.cwd()), 'keys', this.name)
  }

  public generateKeyPair = async () => {
    this.passphrase = randomatic('Aa00!!', 16)
    await mkdir(this.path, { recursive: true })
    const [pem, pub] = [
      await this.generatePrivateKey(),
      await this.generatePublicKey()
    ]
    if (!pem && !pub) {
      await writeFile(join(this.path, '.env'), `KEY_PASSPHRASE=${this.passphrase}`)
      console.log(`✅ Successfully generated key pair for "${this.name}" 🔐`)
    } else {
      console.error(new Error(`❌ Keys for "${this.name}" failed to generate 😓`))
    }
  }

  private generatePrivateKey = async () => {
    const child = spawn('openssl', ['genrsa', '-des3', '-out', `${this.path}/private.pem`, '-passout', `pass:${this.passphrase}`, '2048'])
    // for await (const data of child.stderr) console.log(Buffer.from(data).toString())
    return await new Promise<number>((resolve) => child.on('close', (code) => resolve(code ?? 1)))
  }

  private generatePublicKey = async () => {
    const child = spawn('openssl', ['rsa', '-in', `${this.path}/private.pem`, '-outform', 'PEM', '-pubout', '-out', `${this.path}/public.pem`, '-passin', `pass:${this.passphrase}`])
    // for await (const data of child.stderr) console.log(Buffer.from(data).toString())
    return await new Promise<number>((resolve) => child.on('close', (code) => resolve(code ?? 1)))
  }
}
