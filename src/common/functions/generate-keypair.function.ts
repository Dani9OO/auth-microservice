import { generateKeyPair } from 'crypto'

export default async (passphrase: string) => {
  return await new Promise<{ publicKey: string, privateKey: string }>((resolve, reject) => {
    generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase
      }
    }, (err, publicKey, privateKey) => {
      if (err) reject(err)
      resolve({ publicKey, privateKey })
    })
  })
}
