export default () => {
  const {
    DB_URI,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    PASSPHRASE,
    FRONTEND_URL,
    ADMIN_KEY
  } = process.env

  if (!DB_URI) throw new Error('Database URI is not specified')
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) throw new Error('SMTP credentials are not specified')
  if (!PASSPHRASE) throw new Error('Private Key passphrase is not specified')
  if (!FRONTEND_URL) throw new Error('Frontend URL is not specified')
  if (!ADMIN_KEY) throw new Error('Admin api key is not specified')

  return {
    db: { uri: DB_URI },
    smtp: { host: SMTP_HOST, port: Number(SMTP_PORT), user: SMTP_USER, pass: SMTP_PASS },
    passphrase: PASSPHRASE
  }
}
