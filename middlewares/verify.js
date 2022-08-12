const jwt = require('jsonwebtoken')
const response = require('../helpers/response')
const createErrors = require('http-errors')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const {
  JWT_SECRET_KEY,
  JWT_REFRESH_SECRET_KEY,
  JWT_ALGORITHM
} = process.env
const { getUserModelsById } = require('../models/user')

module.exports = {
  verifyToken: (req, res, next) => {
    try {
      const token = req.headers.authorization
      const getSignedCookie = req.signedCookies

      if (!getSignedCookie) throw new createErrors.UnavailableForLegalReasons('Session unavailable!')

      if (typeof token !== 'undefined') {
        const bearer = token.split(' ')
        const bearerToken = bearer[1]

        jwt.verify(
          bearerToken,
          JWT_SECRET_KEY,
          { algorithms: JWT_ALGORITHM },
          async (err, result) => {
            if (err) {
              throw new createErrors.PreconditionFailed(err.message || err)
            } else {
              const queryDatabase = `SELECT * INTO userTemp FROM users WHERE email = $1;
ALTER TABLE userTemp DROP COLUMN password;
SELECT * FROM userTemp;
DROP TABLE userTemp;`
              const { email } = result
              const queryValues = [email]
              const checkUser = await getUserModelsById(queryDatabase, queryValues)

              if (!checkUser) throw new createErrors.Unauthorized('Access denied, account unregistered!')

              const user = checkUser

              req.data = user

              return next()
            }
          }
        )
      } else {
        throw new createErrors.PreconditionRequired('Bearer token must be conditioned!')
      }
    } catch (error) {
      return response(res, error.status, {
        message: error.message || error
      })
    }
  },
  verifyRefreshToken: (req, res, next) => {
    try {
      const getSignedCookie = req.signedCookies

      if (!getSignedCookie) throw new createErrors.UnavailableForLegalReasons('Session unavailable!')

      const { token } = req.signedCookies

      if (typeof token !== 'undefined') {
        jwt.verify(
          token,
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
        throw new createErrors.PreconditionRequired('Token must be conditioned!')
      }
    } catch (error) {
      return response(res, error.status, {
        message: error.message || error
      })
    }
  }
}
