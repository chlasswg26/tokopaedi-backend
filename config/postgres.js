const { Pool } = require('pg')
require('dotenv').config()
const {
  PGHOST,
  PGUSER,
  PGDATABASE,
  PGPASSWORD,
  PGPORT,
  NODE_ENV
} = process.env

const pool = new Pool({
  user: PGUSER,
  host: PGHOST,
  database: PGDATABASE,
  password: PGPASSWORD,
  port: parseInt(PGPORT),
  connectionTimeoutMillis: 50000,
  idleTimeoutMillis: 60000,
  allowExitOnIdle: true
})

if (NODE_ENV === 'development') {
  pool.on('connect', () => console.log('Postgres connect...'))

  pool.on('error', error => console.log(`Postgres error: ${error.message}`))

  pool.on('remove', () => console.log('Postgres removing...'))

  console.log(`${pool.idleCount} clients currently idle...
${pool.waitingCount} clients queued requests waiting...`)
}

module.exports = pool
