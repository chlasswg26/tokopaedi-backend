const postgres = require('../config/postgres')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const { NODE_ENV } = process.env

module.exports = {
  getAllUserModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM users'
      const queryDatabaseAdditional = `SELECT * FROM users WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, result) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on get all user: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve(result.rows.map(value => {
              delete value.password

              return value
            }))
          }
        })
      })
    })
  },
  getUserByIdModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM users WHERE id = $1'
      const queryDatabaseAdditional = `SELECT * FROM users WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, result) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on get user by id: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve(result.rows[0])
          }
        })
      })
    })
  },
  postUserModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'INSERT INTO users(name, email, password, picture) VALUES($1, $2, $3, $4)'
      const queryDatabaseAdditional = `INSERT INTO users${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on post user: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('New users created!')
          }
        })
      })
    })
  },
  putUserModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'UPDATE users SET name = $1, email = $2, password = $3, picture = $4, role = $5, refresh_token = $6 WHERE id = $7'
      const queryDatabaseAdditional = `UPDATE users SET ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on put user: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('Users updated!')
          }
        })
      })
    })
  },
  deleteUserModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'DELETE FROM users WHERE id = $1'

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on delete user: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('Users deleted!')
          }
        })
      })
    })
  }
}
