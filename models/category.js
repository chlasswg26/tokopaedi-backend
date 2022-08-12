const postgres = require('../config/postgres')
const path = require('node:path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const { NODE_ENV } = process.env

module.exports = {
  getAllCategoryModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM categories'

      postgres.query(queryDatabase, values, (error, result) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on get all category: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve(result.rows)
        }
      })
    })
  },
  getCategoryModelsById: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'SELECT * FROM categories WHERE id = $1'

      postgres.query(queryDatabase, values, (error, result) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on get all category by id: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve(result.rows[0])
        }
      })
    })
  },
  postCategoryModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'INSERT INTO categories(name, stock, price) VALUES($1, $2, $3)'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on post category: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('New categories created!')
        }
      })
    })
  },
  putCategoryModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'UPDATE categories SET name = $1, stock = $2, price = $3 WHERE id = $4'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on put category: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('Categories updated!')
        }
      })
    })
  },
  deleteCategoryModels: (query, values = []) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || 'DELETE FROM categories WHERE id = $1'

      postgres.query(queryDatabase, values, (error, _) => {
        if (error) {
          const errorMessage = error.message

          if (NODE_ENV === 'development') console.log(`Models error on delete category: ${errorMessage}`)

          reject(errorMessage)
        } else {
          resolve('Categories deleted!')
        }
      })
    })
  }
}
