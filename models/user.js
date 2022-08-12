const postgres = require('../config/postgres')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const { NODE_ENV } = process.env

module.exports = {
  getAllUserModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || `SELECT * INTO userTemp FROM users;
ALTER TABLE userTemp DROP COLUMN password;
SELECT * FROM userTemp;
DROP TABLE userTemp;`

      postgres.query(queryDatabase, values, (error, result) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on get all user: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve(result.rows)
        }
      })
    })
  },
  getUserModelsById: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || `SELECT * INTO userTemp FROM users WHERE id = $1;
ALTER TABLE userTemp DROP COLUMN password;
SELECT * FROM userTemp;
DROP TABLE userTemp;`

      postgres.query(queryDatabase, values, (error, result) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on get all user by id: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve(result.rows[0])
        }
      })
    })
  },
  postUserModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'INSERT INTO users(name, stock, price) VALUES($1, $2, $3)'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on post user: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('New users created!')
        }
      })
    })
  },
  putUserModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'UPDATE users SET name = $1, stock = $2, price = $3 WHERE id = $4'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on put user: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('Users updated!')
        }
      })
    })
  },
  deleteUserModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'DELETE FROM users WHERE id = $1'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on delete user: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('Users deleted!')
        }
      })
    })
  }
}
