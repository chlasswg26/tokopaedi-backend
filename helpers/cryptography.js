const response = require('./response')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const {
  ENCRYPTION_PASSWORD,
  ENCRYPTION_SALT,
  ENCRYPTION_DIGEST
} = process.env
const StringCrypto = require('string-crypto')

module.exports = {
  encrypt: (iterationNum = 15, data, res) => {
    if (typeof data === 'function') {
      return response(res, 424, {
        message: 'Type of function is not supported!'
      })
    }

    const { encryptString } = new StringCrypto({
      salt: ENCRYPTION_SALT,
      iterations: iterationNum,
      digest: ENCRYPTION_DIGEST
    })

    return encryptString(typeof data === 'object' ? JSON.stringify(data) : data, ENCRYPTION_PASSWORD)
  },
  decrypt: (iterationNum = 15, data = '') => {
    const { decryptString } = new StringCrypto({
      salt: ENCRYPTION_SALT,
      iterations: iterationNum,
      digest: ENCRYPTION_DIGEST
    })
    const decryptionSignedCookie = decryptString(data, ENCRYPTION_PASSWORD)

    return typeof decryptionSignedCookie === 'undefined' ? {} : decryptionSignedCookie
  }
}
