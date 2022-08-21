const redisClient = require('../config/redis')
require('dotenv').config()
const { NODE_ENV } = process.env
const Duration = require('duration-js')
const response = require('./response')

module.exports = async (
  key,
  data,
  cacheLife,
  res
) => {
  const expiringTime = new Duration(cacheLife)

  redisClient.set(key, JSON.stringify(data), async (err, reply) => {
    if (err) {
      if (NODE_ENV === 'development') console.log('failed to set cache')

      return response(res, err.status || 500, {
        message: err.message || err
      })
    }

    if (reply) {
      if (NODE_ENV === 'development') console.log('redis set cache', Boolean(reply))

      redisClient.expire(key, expiringTime.seconds(), async (err, reply) => {
        if (err) {
          if (NODE_ENV === 'development') console.log('failed to set expiring time of cache')

          return response(res, err.status || 500, {
            message: err.message || err
          })
        }

        if (NODE_ENV === 'development') console.log('redis set expiring time of cache', Boolean(reply))
      })
    }
  })
}
