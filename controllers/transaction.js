const {
  getAllTransactionModels,
  getTransactionByIdModels,
  postTransactionModels,
  putTransactionModels,
  deleteTransactionModels
} = require('../models/transaction')
const response = require('../helpers/response')
const createErrors = require('http-errors')
const { queryWithKey, queryWithValue } = require('../helpers/common')
const { decrypt } = require('../helpers/cryptography')
const { getUserByIdModels } = require('../models/user')

module.exports = {
  getAllTransactionControllers: async (req, res) => {
    try {
      const queryParams = req.query
      let queryDatabase = ''
      let queryAdditionalDatabase = ''
      let result = ''
      let queryForCountRows = ''
      let totalRows = 0

      if (!queryParams) {
        const queryAdditionalDatabase = `A.buyer_id = ${req.userData?.id}`

        result = req.userData?.role === 'admin' ? await getAllTransactionModels() : await getAllTransactionModels(false, false, queryAdditionalDatabase)

        totalRows = result
      } else {
        if (queryParams?.search) {
          queryAdditionalDatabase = `A.status LIKE '%${queryParams.search}%' OR B.name LIKE '%${queryParams.search}%' OR C.title LIKE '%${queryParams.search}%'
OR C.description LIKE '%${queryParams.search}%' OR D.name LIKE '%${queryParams.search}%' OR E.name LIKE '%${queryParams.search}%'
${req.userData?.role === 'admin' ? '' : `WHERE D.id = ${req.userData?.id}`} ORDER BY ${queryParams?.orderBy ? `A.${queryParams?.orderBy}` : 'A.id'} ${queryParams?.sortBy || 'DESC'}`

          queryForCountRows = queryAdditionalDatabase

          queryAdditionalDatabase = `${queryAdditionalDatabase} LIMIT ${parseInt(queryParams?.limit) || 'NULL'} OFFSET ${Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0)}`

          result = await getAllTransactionModels(false, false, queryAdditionalDatabase)
          totalRows = await getAllTransactionModels(false, false, queryForCountRows)
        } else {
          queryDatabase = `SELECT A.id, A.buyer_id, A.product_id, A.quantity, A.price, A.status,
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
ON E.id = C.category_id ${
            req.userData?.role === 'admin'
              ? ''
              : `WHERE A.buyer_id = ${req.userData?.id}`
          } ORDER BY ${
            queryParams?.orderBy ? `A.${queryParams?.orderBy}` : 'A.id'
          } ${queryParams?.sortBy || 'DESC'}`

          queryForCountRows = queryDatabase

          queryDatabase = `${queryDatabase} LIMIT ${parseInt(queryParams?.limit) || 'NULL'} OFFSET ${Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0)}`

          result = await getAllTransactionModels(queryDatabase)
          totalRows = await getAllTransactionModels(queryForCountRows)
        }
      }

      totalRows = totalRows.length

      const totalActiveRows = result.length
      const sheets = Math.ceil(totalRows / (parseInt(queryParams?.limit) || 0))
      const nextPage = (page, limit, total) => (total / limit) > page ? (limit <= 0 ? false : page + 1) : false
      const previousPage = (page) => page <= 1 ? false : page - 1

      const pagination = {
        total: {
          data: totalRows,
          active: totalActiveRows,
          sheet: sheets === Infinity ? 0 : sheets
        },
        page: {
          limit: parseInt(queryParams?.limit) || 0,
          current: parseInt(queryParams?.page) || 1,
          next: nextPage((parseInt(queryParams?.page) || 1), (parseInt(queryParams?.limit) || 0), totalRows),
          previous: previousPage((parseInt(queryParams?.page) || 1))
        }
      }

      const transactions = result.map(value => {
        const buyerId = value?.buyer_id
        const buyerName = value?.buyer_name
        const buyerPicture = value?.buyer_picture
        const productId = value?.product_id
        const productTitle = value?.product_title
        const productDescription = value?.product_description
        const productThumbnail = value?.product_thumbnail
        const productPrice = value?.product_price
        const sellerId = value?.seller_id
        const sellerName = value?.seller_name
        const sellerPicture = value?.seller_picture
        const categoryId = value?.category_id
        const categoryName = value?.category_name

        delete value?.buyer_id
        delete value?.buyer_name
        delete value?.buyer_picture
        delete value?.product_id
        delete value?.product_title
        delete value?.product_description
        delete value?.product_thumbnail
        delete value?.product_price
        delete value?.seller_id
        delete value?.seller_name
        delete value?.seller_picture
        delete value?.category_id
        delete value?.category_name

        return {
          ...value,
          buyer: {
            id: buyerId,
            name: buyerName,
            picture: buyerPicture
          },
          product: {
            id: productId,
            title: productTitle,
            description: productDescription,
            thumbnail: productThumbnail,
            price: productPrice,
            seller: {
              id: sellerId,
              name: sellerName,
              picture: sellerPicture
            },
            category: {
              id: categoryId,
              name: categoryName
            }
          }
        }
      })

      return response(res, 200, result ? transactions : [], pagination)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  getTransactionControllersById: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.id
      const refreshToken = req.signedCookies?.token
      const decryptionTokenFromSignedCookie = decrypt(13, refreshToken)
      const user = await getUserByIdModels(false, [req.userData?.email, decryptionTokenFromSignedCookie], 'email = $1 AND refresh_token = $2')
      const queryAdditionalDatabase = req.userData?.role === 'admin' ? false : 'A.id = $1 AND A.buyer_id = $2'
      const queryValueDatabase = req.userData?.role === 'admin' ? [id] : [id, user?.id]
      const result = await getTransactionByIdModels(false, queryValueDatabase, queryAdditionalDatabase)

      const transaction = {
        ...result,
        buyer: {
          id: result?.buyer_id,
          name: result?.buyer_name,
          picture: result?.buyer_picture
        },
        product: {
          id: result?.product_id,
          title: result?.product_title,
          description: result?.product_description,
          thumbnail: result?.product_thumbnail,
          price: result?.product_price,
          seller: {
            id: result?.seller_id,
            name: result?.seller_name,
            picture: result?.seller_picture
          },
          category: {
            id: result?.category_id,
            name: result?.category_name
          }
        }
      }

      delete transaction?.buyer_id
      delete transaction?.buyer_name
      delete transaction?.buyer_picture
      delete transaction?.product_id
      delete transaction?.product_title
      delete transaction?.product_description
      delete transaction?.product_thumbnail
      delete transaction?.product_price
      delete transaction?.seller_id
      delete transaction?.seller_name
      delete transaction?.seller_picture
      delete transaction?.category_id
      delete transaction?.category_name

      return response(res, 200, result ? transaction : {})
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  postTransactionControllers: async (req, res) => {
    try {
      const data = req.body
      const bodyLength = Object.keys(data).length

      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')

      const queryValueDatabase = [
        req?.userData?.id,
        data.product_id,
        data.quantity,
        data.price
      ]

      const result = await postTransactionModels(false, queryValueDatabase)

      return response(res, 201, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  putTransactionControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length
      const data = req.body
      const bodyLength = Object.keys(data).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')
      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')

      const id = req.params.id
      const refreshToken = req.signedCookies?.token
      const decryptionTokenFromSignedCookie = decrypt(13, refreshToken)
      const user = await getUserByIdModels(false, [req.userData?.email, decryptionTokenFromSignedCookie], 'email = $1 AND refresh_token = $2')
      const prefix = req.userData?.role === 'admin' ? false : `AND buyer_id = ${user?.id}`
      const queryDatabase = queryWithKey(id, 'UPDATE transactions', 'SET', data, prefix)
      const queryValueDatabase = queryWithValue(data)
      const result = await putTransactionModels(queryDatabase, queryValueDatabase)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  deleteTransactionControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.idid
      const refreshToken = req.signedCookies?.token
      const decryptionTokenFromSignedCookie = decrypt(13, refreshToken)
      const user = await getUserByIdModels(false, [req.userData?.email, decryptionTokenFromSignedCookie], 'email = $1 AND refresh_token = $2')
      const queryDatabase = req.userData?.role === 'admin' ? 'DELETE FROM transactions WHERE id = $1' : 'DELETE FROM transactions WHERE id = $1 AND buyer_id = $2'
      const queryValueDatabase = req.userData?.role === 'admin' ? [id] : [id, user?.id]
      const result = await deleteTransactionModels(queryDatabase, queryValueDatabase)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  }
}
