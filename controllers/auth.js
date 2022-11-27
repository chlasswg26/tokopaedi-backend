const { postUserModels, getUserByIdModels, putUserModels } = require('../models/user')
const response = require('../helpers/response')
const createErrors = require('http-errors')
const argon2 = require('argon2')
const jwt = require('jsonwebtoken')
const Duration = require('duration-js')
require('dotenv').config()
const {
  JWT_SECRET_KEY,
  JWT_TOKEN_LIFE,
  JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_TOKEN_LIFE,
  JWT_ALGORITHM,
  NODE_ENV,
  FRONTEND_URL
} = process.env
const { encrypt, legacyEncrypt, legacyDecrypt } = require('../helpers/cryptography')
const { getAllProductModels } = require('../models/product')
const { getAllTransactionModels } = require('../models/transaction')
const { random } = require('../helpers/common')
const registrationTemplate = require('../templates/registration.template')
const verificationTemplate = require('../templates/verify.template')
const sendMail = require('../helpers/mailer')

module.exports = {
  registerControllers: async (req, res) => {
    try {
      const data = req.body
      const bodyLength = Object.keys(data).length
      const user = await getUserByIdModels(false, [data.email], 'email = $1')
      let queryAdditionalDatabase = ''
      let queryValueDatabase = ''
      let result = ''

      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')
      if (user) throw new createErrors.Conflict('Account has been registered!')

      const hashPassword = await argon2.hash(data.password, { type: argon2.argon2id })
      const randomCode = random(12)
      const encryptRandomCode = legacyEncrypt(randomCode)

      if (data?.role) {
        queryAdditionalDatabase = '(name, email, password, role, verification_code) VALUES($1, $2, $3, $4, $5)'
        queryValueDatabase = [
          data.name,
          data.email,
          hashPassword,
          data.role,
          randomCode
        ]

        result = await postUserModels(false, queryValueDatabase, queryAdditionalDatabase)
      } else {
        queryAdditionalDatabase = '(name, email, password, verification_code) VALUES($1, $2, $3, $4)'
        queryValueDatabase = [
          data.name,
          data.email,
          hashPassword,
          randomCode
        ]

        result = await postUserModels(false, queryValueDatabase, queryAdditionalDatabase)
      }

      if (!result) throw new createErrors.NotImplemented('Registration failed!')

      await sendMail(
        data.email,
        'Verify your account',
        registrationTemplate(req, encryptRandomCode)
      )

      return response(res, 201, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  verificationControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const decryptVerificationCode = legacyDecrypt(params.code)
      const user = await getUserByIdModels(false, [decryptVerificationCode], 'verification_code = $1')

      if (!user) throw new createErrors.NotAcceptable('Verification code is not valid!')

      const id = user.id
      const queryAdditionalDatabase = 'verification_code = \'\' WHERE id = $1'
      const result = await putUserModels(false, [id], queryAdditionalDatabase)

      if (!result) throw new createErrors.NotImplemented('Verification failed!')

      await sendMail(
        user.email,
        'Account verified',
        verificationTemplate(req)
      )

      res.writeHead(302, { Location: `${FRONTEND_URL}/auth/signin?msg=ok` })
      res.end()
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  loginControllers: async (req, res) => {
    try {
      const data = req.body
      const bodyLength = Object.keys(data).length
      const user = await getUserByIdModels(false, [data.email], 'email = $1')
      const sessionToken = req.signedCookies?.token

      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')
      if (!user) throw new createErrors.ExpectationFailed('Unregistered account!')
      if (sessionToken) throw new createErrors.UnprocessableEntity('Session still active, you need to log out!')
      if (user?.verification_code !== '') throw new createErrors.UnprocessableEntity('Account need to verification!')

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
      const encryptedCookieContent = await encrypt(13, refreshToken)
      const maxAgeCookie = new Duration(JWT_REFRESH_TOKEN_LIFE)

      res.cookie('token', encryptedCookieContent, {
        maxAge: maxAgeCookie,
        expires: maxAgeCookie + Date.now(),
        httpOnly: true,
        sameSite: 'none',
        secure: NODE_ENV === 'production',
        signed: true
      })

      const addedRefreshToken = await putUserModels(false, [refreshToken, user.email], 'refresh_token = $1 WHERE email = $2')

      if (!addedRefreshToken) throw new createErrors.NotAcceptable('Failed to adding refresh token!')

      const userProducts = await getAllProductModels(false, [user.id], 'products.seller_id = $1')
      const userTransactions = await getAllTransactionModels(false, [user.id], 'A.buyer_id = $1')

      const products = userProducts.map(value => {
        const categoryId = value?.category_id
        const categoryName = value?.category
        const sellerId = value?.seller_id
        const sellerName = value?.seller
        const sellerPicture = value?.seller_picture

        delete value?.category_id
        delete value?.seller_id
        delete value?.seller_picture

        return {
          ...value,
          category: {
            id: categoryId,
            name: categoryName
          },
          seller: {
            id: sellerId,
            name: sellerName,
            picture: sellerPicture
          }
        }
      })
      const transactions = userTransactions.map(value => {
        const buyerId = value?.buyer_id
        const buyerName = value?.buyer_name
        const buyerPicture = value?.buyer_picture
        const productId = value?.product_id
        const productTitle = value?.product_title
        const productDescription = value?.product_description
        const productThumbnail = value?.product_thumbnail
        const productPrice = value?.product_price
        const sellerId = value?.seller_id
        const sellerName = value?.seller_name
        const sellerPicture = value?.seller_picture
        const categoryId = value?.category_id
        const categoryName = value?.category_name

        delete value?.buyer_id
        delete value?.buyer_name
        delete value?.buyer_picture
        delete value?.product_id
        delete value?.product_title
        delete value?.product_description
        delete value?.product_thumbnail
        delete value?.product_price
        delete value?.seller_id
        delete value?.seller_name
        delete value?.seller_picture
        delete value?.category_id
        delete value?.category_name

        return {
          ...value,
          buyer: {
            id: buyerId,
            name: buyerName,
            picture: buyerPicture
          },
          product: {
            id: productId,
            title: productTitle,
            description: productDescription,
            thumbnail: productThumbnail,
            price: productPrice,
            seller: {
              id: sellerId,
              name: sellerName,
              picture: sellerPicture
            },
            category: {
              id: categoryId,
              name: categoryName
            }
          }
        }
      })

      delete user.refresh_token
      delete user?.verification_code

      const users = {
        ...user,
        accessToken,
        products,
        transactions
      }

      return response(res, 202, users)
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
      delete user.refresh_token
      delete user.verification_code

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
