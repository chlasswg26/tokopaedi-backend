const redis = require('redis')
require('dotenv').config()
const { REDIS_URL, NODE_ENV } = process.env

const redisOptions = NODE_ENV === 'production' ? { url: REDIS_URL, legacyMode: true } : { legacyMode: true }

const redisClient = redis.createClient(redisOptions)

redisClient.connect()

if (NODE_ENV === 'development') {
  redisClient.on('error', (error) => {
    console.log('Something went wrong:', error)
  })

  redisClient.on('connect', () => {
    console.log('Redis client connected')
  })
}

module.exports = redisClient
