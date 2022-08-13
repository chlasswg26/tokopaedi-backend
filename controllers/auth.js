const { postUserModels, getUserByIdModels, putUserModels } = require('../models/user')
const response = require('../helpers/response')
const createErrors = require('http-errors')
const argon2 = require('argon2')
const cloudinary = require('cloudinary')
const jwt = require('jsonwebtoken')
const Duration = require('duration-js')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const {
  JWT_SECRET_KEY,
  JWT_TOKEN_LIFE,
  JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_TOKEN_LIFE,
  JWT_ALGORITHM,
  NODE_ENV
} = process.env
const { encrypt } = require('../helpers/cryptography')

module.exports = {
  registerControllers: async (req, res) => {
    try {
      const data = req.body
      const user = await getUserByIdModels(false, [data.email], 'email = $1')
      const file = req.files?.thumbnail || {}

      if (user) throw new createErrors.Conflict('Account has been registered!')

      const hashPassword = await argon2.hash(data.password, { type: argon2.argon2id })

      if (file.length) {
        cloudinary.v2.config({ secure: true })

        const uploadedPicture = await cloudinary.v2.uploader.upload(file[0].path, {
          use_filename: false,
          unique_filename: true,
          overwrite: true
        })

        data.image = uploadedPicture.secure_url || ''
      }

      const queryPostValues = [
        data.name,
        data.email,
        hashPassword,
        data.image
      ]
      const result = await postUserModels(false, queryPostValues)

      if (!result) throw new createErrors.NotImplemented('Registration failed!')

      return response(res, 201, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  loginControllers: async (req, res) => {
    try {
      const data = req.body
      const user = await getUserByIdModels(false, [data.email], 'email = $1')

      if (!user) throw new createErrors.ExpectationFailed('Unregistered account!')

      const verifyPassword = await argon2.verify(user?.password, data.password)

      delete user.password

      if (!verifyPassword) throw new createErrors.NotAcceptable('Password did not match!')

      const dataToSign = { email: user.email }
      const accessToken = jwt.sign(dataToSign, JWT_SECRET_KEY, {
        algorithm: JWT_ALGORITHM,
        expiresIn: JWT_TOKEN_LIFE
      })
      const refreshToken = jwt.sign(dataToSign, JWT_REFRESH_SECRET_KEY, {
        algorithm: JWT_ALGORITHM,
        expiresIn: JWT_REFRESH_TOKEN_LIFE
      })
      const encryptedCookieContent = encrypt(13, refreshToken, response)
      const maxAgeCookie = new Duration(JWT_REFRESH_TOKEN_LIFE)

      res.cookie('token', encryptedCookieContent, {
        maxAge: maxAgeCookie,
        expires: maxAgeCookie + Date.now(),
        httpOnly: true,
        sameSite: 'strict',
        secure: NODE_ENV === 'production',
        signed: true
      })

      const addedRefreshToken = await putUserModels(false, [refreshToken, user.email], 'refresh_token = $1 WHERE email = $2')

      if (!addedRefreshToken) throw new createErrors.NotAcceptable('Failed to adding refresh token!')

      return response(res, 202, { ...user, accessToken })
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  refreshTokenControllers: async (req, res) => {
    try {
      const data = req.data

      if (!data) throw new createErrors.NotExtended('Session not found!')

      const user = await getUserByIdModels(false, [data.email], 'email = $1')

      if (!user) throw new createErrors.ExpectationFailed('Unregistered account!')

      delete user.password

      const dataToSign = { email: user.email }
      const accessToken = jwt.sign(dataToSign, JWT_SECRET_KEY, {
        algorithm: JWT_ALGORITHM,
        expiresIn: JWT_TOKEN_LIFE
      })

      return response(res, 200, { token: accessToken })
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  logoutControllers: async (req, res) => {
    try {
      const user = req.userData

      if (!user) throw new createErrors.NotExtended('Session not found!')

      const removeRefreshToken = await putUserModels(false, ['', user.email], 'refresh_token = $1 WHERE email = $2')

      if (!removeRefreshToken) throw new createErrors.NotAcceptable('Failed to remove refresh token!')

      res.clearCookie('token')

      return response(res, 200, {
        message: 'Successfully log out'
      })
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  }
}
