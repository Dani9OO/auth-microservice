export default () => {
  const {
    DB_URI,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS
  } = process.env

  if (!DB_URI) throw new Error('Database URI is not specified')
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) throw new Error('SMTP credentials are not specified')

  return {
    db: { uri: DB_URI },
    smtp: { host: SMTP_HOST, port: Number(SMTP_PORT), user: SMTP_USER, pass: SMTP_PASS }
  }
}
