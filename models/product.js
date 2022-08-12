const postgres = require('../config/postgres')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const { NODE_ENV } = process.env

module.exports = {
  getAllProductModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM products'

      postgres.query(queryDatabase, values, (error, result) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on get all product: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve(result.rows)
        }
      })
    })
  },
  getProductModelsById: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM products WHERE id = $1'

      postgres.query(queryDatabase, values, (error, result) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on get all product by id: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve(result.rows[0])
        }
      })
    })
  },
  postProductModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'INSERT INTO products(name, stock, price) VALUES($1, $2, $3)'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on post product: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('New products created!')
        }
      })
    })
  },
  putProductModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'UPDATE products SET name = $1, stock = $2, price = $3 WHERE id = $4'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on put product: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('Products updated!')
        }
      })
    })
  },
  deleteProductModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'DELETE FROM products WHERE id = $1'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on delete product: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('Products deleted!')
        }
      })
    })
  }
}
