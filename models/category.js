const postgres = require('../config/postgres')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const { NODE_ENV } = process.env

module.exports = {
  getAllCategoryModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM categories'
      const queryDatabaseAdditional = `SELECT * FROM categories WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, result) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on get all category: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve(result.rows)
          }
        })
      })
    })
  },
  getCategoryByIdModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM categories WHERE id = $1'
      const queryDatabaseAdditional = `SELECT * FROM categories WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, result) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on get category by id: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve(result.rows[0])
          }
        })
      })
    })
  },
  postCategoryModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'INSERT INTO categories(name) VALUES($1)'
      const queryDatabaseAdditional = `INSERT INTO categories${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on post category: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('New categories created!')
          }
        })
      })
    })
  },
  putCategoryModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'UPDATE categories SET name = $1 WHERE id = $2'
      const queryDatabaseAdditional = `UPDATE categories SET ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryDatabaseAdditional : queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on put category: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('Categories updated!')
          }
        })
      })
    })
  },
  deleteCategoryModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'DELETE FROM categories WHERE id = $1'

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(queryDatabase, values, (error, _) => {
          done()

          if (error) {
            const errorMessage = error.message

            if (NODE_ENV === 'development') console.log(`Models error on delete category: ${errorMessage}`)

            reject(errorMessage)
          } else {
            resolve('Categories deleted!')
          }
        })
      })
    })
  }
}
