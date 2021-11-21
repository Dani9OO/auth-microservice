import { createTransport, Transporter } from 'nodemailer'

export class Mailer {
  private _transporter: Transporter

  public readonly sender: string

  constructor (host: string, port: number, auth: { user: string, pass: string }) {
    this.sender = auth.user
    this._transporter = createTransport({ port, host, secure: true, auth })
  }

  public verify = async () => {
    await this._transporter.verify()
  }

  public get transporter () {
    return this._transporter
  }
}
