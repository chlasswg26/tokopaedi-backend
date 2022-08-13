const postgres = require('../config/postgres')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const { NODE_ENV } = process.env

module.exports = {
  getAllProductModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM products'
      const queryDatabaseAdditional = `SELECT * FROM products WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, result) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on get all product: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve(result.rows)
          }
        })
      })
    })
  },
  getProductByIdModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM products WHERE id = $1'
      const queryDatabaseAdditional = `SELECT * FROM products WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, result) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on get product by id: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve(result.rows[0])
          }
        })
      })
    })
  },
  postProductModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'INSERT INTO products(title, description, thumbnail, price, seller_id, category_id) VALUES($1, $2, $3, $4, $5, $6)'
      const queryDatabaseAdditional = `INSERT INTO products${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on post product: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('New products created!')
          }
        })
      })
    })
  },
  putProductModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'UPDATE products SET title = $1, description = $2, thumbnail = $3, price = $4, seller_id = $5, category_id = $6 WHERE id = $7'
      const queryDatabaseAdditional = `UPDATE products SET ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, _) => {
          if (error) {
            done()

            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on put product: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('Products updated!')
          }
        })
      })
    })
  },
  deleteProductModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'DELETE FROM products WHERE id = $1'

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on delete product: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('Products deleted!')
          }
        })
      })
    })
  }
}
