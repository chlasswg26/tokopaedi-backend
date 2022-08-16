const response = require('../helpers/response')
const { getUserByIdModels } = require('../models/user')
const createErrors = require('http-errors')

module.exports = {
  grantedAll: async (req, res, next) => {
    try {
      const email = req.userData.email
      const queryDatabase = 'SELECT * FROM users WHERE email = $1'
      const queryValueDatabase = [email]
      const checkUser = await getUserByIdModels(queryDatabase, queryValueDatabase)

      if (!checkUser) throw new createErrors.Unauthorized('Access denied, account unregistered!')

      const { role } = checkUser

      switch (role) {
        case 'admin':
          return next()
        case 'seller':
          return next()
        case 'buyer':
          return next()

        default:
          throw new createErrors.Unauthorized('Access denied, who are you?')
      }
    } catch (error) {
      return response(res, error.status, {
        message: error.message || error
      })
    }
  },
  grantedSellerAndAdmin: async (req, res, next) => {
    try {
      const email = req.userData.email
      const queryDatabase = 'SELECT * FROM users WHERE email = $1'
      const queryValueDatabase = [email]
      const checkUser = await getUserByIdModels(queryDatabase, queryValueDatabase)

      if (!checkUser) throw new createErrors.Unauthorized('Access denied, account unregistered!')

      const { role } = checkUser

      switch (role) {
        case 'admin':
          return next()
        case 'seller':
          return next()

        default:
          throw new createErrors.Unauthorized('Access denied, who are you?')
      }
    } catch (error) {
      return response(res, error.status, {
        message: error.message || error
      })
    }
  },
  grantedOnlyAdmin: async (req, res, next) => {
    try {
      const email = req.userData.email
      const queryDatabase = 'SELECT * FROM users WHERE email = $1'
      const queryValueDatabase = [email]
      const checkUser = await getUserByIdModels(queryDatabase, queryValueDatabase)

      if (!checkUser) throw new createErrors.Unauthorized('Access denied, account unregistered!')

      const { role } = checkUser

      switch (role) {
        case 'admin':
          return next()

        default:
          throw new createErrors.Unauthorized('Access denied, who are you?')
      }
    } catch (error) {
      return response(res, error.status, {
        message: error.message || error
      })
    }
  }
}
