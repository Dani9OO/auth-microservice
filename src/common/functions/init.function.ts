import { mkdir, readdir, writeFile } from 'fs/promises'
import { resolve, join } from 'path'
import { isError } from './error-typeguard.function'
import generateKeypair from './generate-keypair.function'

export const init = async (passphrase: string) => {
  try {
    const dir = join(resolve(process.cwd()), 'keys')
    const keys = await readdir(dir)
    if (!['private.pem', 'public.pem'].every(key => keys.includes(key))) {
      console.log('Initializing authentication microservice...')
      const { publicKey, privateKey } = await generateKeypair(passphrase)
      await writeFile(join(dir, 'public.pem'), publicKey)
      await writeFile(join(dir, 'private.pem'), privateKey)
      console.log('Authentication microservice initialization completed')
    }
  } catch (error) {
    if (isError(error) && error.code === 'ENOENT') {
      await mkdir('keys')
    }
  }
}
