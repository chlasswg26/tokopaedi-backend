const postgres = require('../config/postgres')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const { NODE_ENV } = process.env

module.exports = {
  getAllTransactionModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM transactions'
      const queryDatabaseAdditional = `SELECT * FROM transactions WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, result) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on get all transaction: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve(result.rows)
          }
        })
      })
    })
  },
  getTransactionByIdModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM transactions WHERE id = $1'
      const queryDatabaseAdditional = `SELECT * FROM transactions WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, result) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on get transaction by id: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve(result.rows[0])
          }
        })
      })
    })
  },
  postTransactionModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'INSERT INTO transactions(buyer_id, product_id, amount, price) VALUES($1, $2, $3, $4)'
      const queryDatabaseAdditional = `INSERT INTO transactions${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on post transaction: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('New transactions created!')
          }
        })
      })
    })
  },
  putTransactionModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'UPDATE transactions SET buyer_id = $1, product_id = $2, amount = $3, price = $4 WHERE id = $5'
      const queryDatabaseAdditional = `UPDATE transactions SET ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on put transaction: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('Transactions updated!')
          }
        })
      })
    })
  },
  deleteTransactionModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'DELETE FROM transactions WHERE id = $1'

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on delete transaction: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('Transactions deleted!')
          }
        })
      })
    })
  }
}
