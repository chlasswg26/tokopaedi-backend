require('dotenv').config()
const {
  ENCRYPTION_PASSWORD,
  ENCRYPTION_SALT,
  ENCRYPTION_DIGEST
} = process.env
const StringCrypto = require('string-crypto')
const crypto = require('node:crypto')
const algorithm = 'aes-128-cbc'
const salt = 'foobar'
const hash = crypto.createHash('sha1')
const createErrors = require('http-errors')

hash.update(salt)

const key = hash.digest().slice(0, 16)
crypto.createHash('sha256').update(String('cokers')).digest('base64').substr(0, 32)
const iv = crypto.randomBytes(16)

module.exports = {
  encrypt: async (iterationNum = 15, data) => {
    return new Promise((resolve, reject) => {
      if (typeof data === 'function') reject(new createErrors.FailedDependency('Type of function is not supported!'))

      const { encryptString } = new StringCrypto({
        salt: ENCRYPTION_SALT,
        iterations: iterationNum,
        digest: ENCRYPTION_DIGEST
      })
      const encryptedData = encryptString(typeof data === 'object' ? data : data, ENCRYPTION_PASSWORD)

      resolve(encryptedData)
    })
  },
  decrypt: (iterationNum = 15, data = '') => {
    const { decryptString } = new StringCrypto({
      salt: ENCRYPTION_SALT,
      iterations: iterationNum,
      digest: ENCRYPTION_DIGEST
    })
    const decryptionSignedCookie = decryptString(data, ENCRYPTION_PASSWORD)

    return typeof decryptionSignedCookie === 'undefined' ? {} : decryptionSignedCookie
  },
  legacyEncrypt: (text) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(text)
    encrypted = Buffer.concat([encrypted, cipher.final()])

    return `${encrypted.toString('hex')}:${iv.toString('hex')}`
  },
  legacyDecrypt: (encryption) => {
    const encryptionData = encryption.split(':')
    const iv = Buffer.from(encryptionData[1], 'hex')
    const encryptedText = Buffer.from(encryptionData[0], 'hex')

    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
  }
}
