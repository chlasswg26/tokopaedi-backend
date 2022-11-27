const jwt = require('jsonwebtoken')
const response = require('../helpers/response')
const { decrypt } = require('../helpers/cryptography')
const createErrors = require('http-errors')
require('dotenv').config()
const {
  JWT_SECRET_KEY,
  JWT_REFRESH_SECRET_KEY,
  JWT_ALGORITHM
} = process.env
const { getUserByIdModels } = require('../models/user')

module.exports = {
  verifyToken: (req, res, next) => {
    try {
      const token = req.headers.authorization
      const signedCookie = req.signedCookies

      if (!signedCookie?.token) throw new createErrors.UnavailableForLegalReasons('Session unavailable')

      if (typeof token !== 'undefined') {
        const bearer = token.split(' ')
        const bearerToken = bearer[1]

        jwt.verify(
          bearerToken,
          JWT_SECRET_KEY,
          { algorithms: JWT_ALGORITHM },
          async (err, result) => {
            if (err) {
              return response(res, err.status || 412, {
                message: err.message || err
              })
            } else {
              const user = await getUserByIdModels(false, [result.email], 'email = $1')

              if (!user) throw new createErrors.Unauthorized('Access denied, account unregistered!')

              req.userData = user

              return next()
            }
          }
        )
      } else {
        throw new createErrors.PreconditionRequired('Bearer token must be conditioned!')
      }
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  verifyRefreshToken: (req, res, next) => {
    try {
      const signedCookie = req.signedCookies

      if (!signedCookie?.token) throw new createErrors.UnavailableForLegalReasons('Session unavailable')

      const { token } = req.signedCookies
      const decryptionTokenFromSignedCookie = decrypt(13, token)

      if (typeof token !== 'undefined') {
        jwt.verify(
          decryptionTokenFromSignedCookie,
          JWT_REFRESH_SECRET_KEY,
          { algorithms: JWT_ALGORITHM },
          async (err, result) => {
            if (err) {
              throw new createErrors.PreconditionFailed(err.message || err)
            } else {
              req.data = result

              return next()
            }
          }
        )
      } else {
        throw new createErrors.PreconditionRequired('Refresh token must be conditioned!')
      }
    } catch (error) {
      return response(res, error.status, {
        message: error.message || error
      })
    }
  }
}
