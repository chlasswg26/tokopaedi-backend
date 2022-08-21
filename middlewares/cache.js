const redisClient = require('../config/redis')
const { mappingKey } = require('../helpers/common')
const response = require('../helpers/response')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  cacheAllProducts: (req, res, next) => {
    const redisKey = mappingKey(req.query)

    redisClient.get(`product:${redisKey}`, (error, result) => {
      if (error) {
        if (NODE_ENV === 'development') console.log('redis error', error)

        return response(res, error.status || 500, {
          message: error.message || error
        })
      }

      if (result !== null) {
        if (NODE_ENV === 'development') console.log('redis filled')

        const cache = JSON.parse(result)

        return response(res, 200, cache.data, cache.pagination)
      } else {
        if (NODE_ENV === 'development') console.log('redis not set, next please')

        next()
      }
    })
  },
  cacheSingleProduct: (req, res, next) => {
    const redisKey = req.params?.id

    redisClient.get(`product/${redisKey}`, (error, result) => {
      if (error) {
        if (NODE_ENV === 'development') console.log('redis error', error)

        return response(res, error.status || 500, {
          message: error.message || error
        })
      }

      if (result !== null) {
        if (NODE_ENV === 'development') console.log('redis filled')

        const cache = JSON.parse(result)

        return response(res, 200, cache)
      } else {
        if (NODE_ENV === 'development') console.log('redis not set, next please')

        next()
      }
    })
  },
  removeCacheSingleProduct: async (req, res, next) => {
    try {
      const redisKeySingleProduct = `product/${req?.params?.id}`

      await redisClient.del(redisKeySingleProduct)

      next()
    } catch (error) {
      return response(res, error?.status || 500, {
        message: error.message || error
      })
    }
  },
  removeCacheAllProduct: async (_, res, next) => {
    try {
      const redisKeyAllProduct = 'product:*'

      await redisClient.del(redisKeyAllProduct)

      next()
    } catch (error) {
      return response(res, error?.status || 500, {
        message: error.message || error
      })
    }
  }
}
