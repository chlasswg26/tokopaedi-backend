const postgres = require('../config/postgres')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const { NODE_ENV } = process.env

module.exports = {
  getAllTransactionModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM transactions'

      postgres.query(queryDatabase, values, (error, result) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on get all transaction: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve(result.rows)
        }
      })
    })
  },
  getTransactionModelsById: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM transactions WHERE id = $1'

      postgres.query(queryDatabase, values, (error, result) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on get all transaction by id: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve(result.rows[0])
        }
      })
    })
  },
  postTransactionModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'INSERT INTO transactions(name, stock, price) VALUES($1, $2, $3)'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on post transaction: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('New transactions created!')
        }
      })
    })
  },
  putTransactionModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'UPDATE transactions SET name = $1, stock = $2, price = $3 WHERE id = $4'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on put transaction: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('Transactions updated!')
        }
      })
    })
  },
  deleteTransactionModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'DELETE FROM transactions WHERE id = $1'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on delete transaction: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('Transactions deleted!')
        }
      })
    })
  }
}
