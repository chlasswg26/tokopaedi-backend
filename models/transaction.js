const postgres = require('../config/postgres')
require('dotenv').config()
const { NODE_ENV } = process.env

module.exports = {
  getAllTransactionModels: (query, values = [], additional) => {
    return new Promise((resolve, reject) => {
      const queryDatabase = query || `SELECT A.id, A.buyer_id, A.product_id, A.quantity, A.price, A.status,
B.name AS buyer_name, B.picture AS buyer_picture,
C.title AS product_title, C.description AS product_description, C.thumbnail AS product_thumbnail, C.price AS product_price,
D.id AS seller_id, D.name AS seller_name, D.picture AS seller_picture,
E.id AS category_id, E.name AS category_name, A.created_at, A.updated_at
FROM transactions AS A
INNER JOIN users AS B
ON B.id = A.buyer_id
INNER JOIN products AS C
ON C.id = A.product_id
INNER JOIN users AS D
ON D.id = C.seller_id
INNER JOIN categories AS E
ON E.id = C.category_id`
      const queryAdditionalDatabase = `SELECT A.id, A.buyer_id, A.product_id, A.quantity, A.price, A.status,
B.name AS buyer_name, B.picture AS buyer_picture,
C.title AS product_title, C.description AS product_description, C.thumbnail AS product_thumbnail, C.price AS product_price,
D.id AS seller_id, D.name AS seller_name, D.picture AS seller_picture,
E.id AS category_id, E.name AS category_name, A.created_at, A.updated_at
FROM transactions AS A
INNER JOIN users AS B
ON B.id = A.buyer_id
INNER JOIN products AS C
ON C.id = A.product_id
INNER JOIN users AS D
ON D.id = C.seller_id
INNER JOIN categories AS E
ON E.id = C.category_id WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryAdditionalDatabase : queryDatabase, values, (error, result) => {
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
      const queryDatabase = query || `SELECT A.id, A.buyer_id, A.product_id, A.quantity, A.price, A.status,
B.name AS buyer_name, B.picture AS buyer_picture,
C.title AS product_title, C.description AS product_description, C.thumbnail AS product_thumbnail, C.price AS product_price,
D.id AS seller_id, D.name AS seller_name, D.picture AS seller_picture,
E.id AS category_id, E.name AS category_name, A.created_at, A.updated_at
FROM transactions AS A
INNER JOIN users AS B
ON B.id = A.buyer_id
INNER JOIN products AS C
ON C.id = A.product_id
INNER JOIN users AS D
ON D.id = C.seller_id
INNER JOIN categories AS E
ON E.id = C.category_id WHERE A.id = $1`
      const queryAdditionalDatabase = `SELECT A.id, A.buyer_id, A.product_id, A.quantity, A.price, A.status,
B.name AS buyer_name, B.picture AS buyer_picture,
C.title AS product_title, C.description AS product_description, C.thumbnail AS product_thumbnail, C.price AS product_price,
D.id AS seller_id, D.name AS seller_name, D.picture AS seller_picture,
E.id AS category_id, E.name AS category_name, A.created_at, A.updated_at
FROM transactions AS A
INNER JOIN users AS B
ON B.id = A.buyer_id
INNER JOIN products AS C
ON C.id = A.product_id
INNER JOIN users AS D
ON D.id = C.seller_id
INNER JOIN categories AS E
ON E.id = C.category_id WHERE ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryAdditionalDatabase : queryDatabase, values, (error, result) => {
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
      const queryDatabase = query || 'INSERT INTO transactions(buyer_id, product_id, quantity, price) VALUES($1, $2, $3, $4)'
      const queryAdditionalDatabase = `INSERT INTO transactions${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryAdditionalDatabase : queryDatabase, values, (error, _) => {
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
      const queryDatabase = query || 'UPDATE transactions SET buyer_id = $1, product_id = $2, quantity = $3, price = $4 WHERE id = $5'
      const queryAdditionalDatabase = `UPDATE transactions SET ${additional}`

      postgres.connect((err, client, done) => {
        if (err) reject(err)

        client.query(additional ? queryAdditionalDatabase : queryDatabase, values, (error, _) => {
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
