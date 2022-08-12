const nodemailer = require('nodemailer')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const {
  NODE_ENV,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USERNAME,
  SMTP_PASSWORD
} = process.env

const createTestAccount = await nodemailer.createTestAccount()
const transporter = nodemailer.createTransport({
  host: NODE_ENV === 'development' ? 'smtp.ethereal.email' : SMTP_HOST,
  port: NODE_ENV === 'development' ? 587 : SMTP_PORT,
  secure: NODE_ENV === 'production',
  auth: {
    user: NODE_ENV === 'development' ? createTestAccount.user : SMTP_USERNAME,
    pass: NODE_ENV === 'development' ? createTestAccount.pass : SMTP_PASSWORD
  }
})

module.exports = transporter
