const postgres = require('../config/postgres')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  getProfileModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM users WHERE id = $1'
      const queryAdditionalDatabase = `SELECT * FROM users WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryAdditionalDatabase : queryDatabase, values, (error, result) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on get profile: ${errorMessage}`)

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
  putProfileModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'UPDATE users SET name = $1, email = $2, password = $3, picture = $4, role = $5, refresh_token = $6 WHERE id = $7'
      const queryAdditionalDatabase = `UPDATE users SET ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryAdditionalDatabase : queryDatabase, values, (error, _) => {
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
  }
}
