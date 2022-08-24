const redisClient = require('../config/redis')
require('dotenv').config()
const { NODE_ENV } = process.env
const Duration = require('duration-js')
const createErrors = require('http-errors')

module.exports = async (
  key,
  data,
  cacheLife
) => {
  return new Promise((resolve, reject) => {
    const expiringTime = new Duration(cacheLife)

    redisClient.set(key, JSON.stringify(data), (err, reply) => {
      if (err) {
        if (NODE_ENV === 'development') console.log('failed to set cache')

        reject(new createErrors[err.status || 501](err.message || 'Failed to set cache'))
      }

      if (reply) {
        if (NODE_ENV === 'development') console.log('redis set cache', Boolean(reply))

        redisClient.expire(key, expiringTime.seconds(), (err, reply) => {
          if (err) {
            if (NODE_ENV === 'development') console.log('failed to set expiring time of cache')

            reject(new createErrors[err.status || 501](err.message || 'Failed to set expiring time of cache'))
          }

          if (NODE_ENV === 'development') console.log('redis set expiring time of cache', Boolean(reply))

          resolve(true)
        })
      }
    })
  })
}
