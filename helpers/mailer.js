const transporter = require('../config/nodemailer')
const createErrors = require('http-errors')
require('dotenv').config()
const { EMAIL_SERVICE, SITE_NAME, NODE_ENV } = process.env

const sendMail = async (email, subject, callbackTemplate) => {
  return new Promise((resolve, reject) => {
    const transporterOptions = {
      from: EMAIL_SERVICE || 'support@demo.com',
      to: email,
      subject: `${SITE_NAME} services: ${subject}`,
      html: callbackTemplate
    }

    transporter.sendMail(transporterOptions, (err, info) => {
      if (err) {
        if (NODE_ENV === 'development') console.log(`Transporter error: ${err}`)

        reject(new createErrors.BadGateway(err.message || 'Email not sent'))
      }

      if (NODE_ENV === 'development') console.log(`Transporter success: ${JSON.stringify(info)}`)

      resolve(info.response)
    })
  })
}

module.exports = sendMail
