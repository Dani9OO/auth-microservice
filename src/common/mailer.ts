import { createTransport, Transporter } from 'nodemailer'

export class Mailer {
  private _transporter: Transporter

  constructor (host: string, port: number, auth: { user: string, password: string }) {
    this._transporter = createTransport({ port, host, secure: true, auth })
  }

  public verify = async () => {
    await this._transporter.verify()
  }

  public get transporter () {
    return this._transporter
  }
}
