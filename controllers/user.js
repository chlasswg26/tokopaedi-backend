const {
  getAllUserModels,
  getUserByIdModels,
  postUserModels,
  putUserModels,
  deleteUserModels
} = require('../models/user')
const response = require('../helpers/response')
const createErrors = require('http-errors')
const argon2 = require('argon2')
const cloudinary = require('cloudinary')
const { getAllProductModels } = require('../models/product')
const { getAllTransactionModels } = require('../models/transaction')
const { queryWithKey, queryWithValue } = require('../helpers/common')

module.exports = {
  getAllUserControllers: async (req, res) => {
    try {
      const queryParams = req.query
      let queryDatabase = ''
      let queryAdditionalDatabase = ''
      let result = ''
      let queryForCountRows = ''
      let totalRows = 0

      if (!queryParams) {
        result = await getAllUserModels()

        totalRows = result
      } else {
        if (queryParams?.search) {
          queryAdditionalDatabase = `name LIKE '%${queryParams.search}%' ORDER BY ${queryParams?.orderBy || 'id'} ${queryParams?.sortBy || 'DESC'}`

          queryForCountRows = queryAdditionalDatabase

          queryAdditionalDatabase = `${queryAdditionalDatabase} LIMIT ${parseInt(queryParams?.limit) || 'NULL'} OFFSET ${Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0)}`

          result = await getAllUserModels(false, false, queryAdditionalDatabase)
          totalRows = await getAllUserModels(false, false, queryForCountRows)
        } else {
          queryDatabase = `SELECT * FROM users ORDER BY ${queryParams?.orderBy || 'id'} ${queryParams?.sortBy || 'DESC'}`

          queryForCountRows = queryDatabase

          queryDatabase = `${queryDatabase} LIMIT ${parseInt(queryParams?.limit) || 'NULL'} OFFSET ${Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0)}`

          result = await getAllUserModels(queryDatabase)
          totalRows = await getAllUserModels(queryForCountRows)
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

      const users = result.map(value => {
        delete value.refresh_token
        delete value.verification_code

        return value
      })

      return response(res, 200, users || [], pagination)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  getUserControllersById: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.id
      const queryValueDatabaseDatabase = [id]
      const result = await getUserByIdModels(false, queryValueDatabaseDatabase)
      const userProducts = await getAllProductModels(false, [id], 'products.seller_id = $1')
      const userTransactions = await getAllTransactionModels(false, [id], 'A.buyer_id = $1')

      delete result.password
      delete result.refresh_token
      delete result.verification_code

      const products = userProducts.map(value => {
        const categoryId = value?.category_id
        const categoryName = value?.category
        const sellerId = value?.seller_id
        const sellerName = value?.seller
        const sellerPicture = value?.seller_picture

        delete value?.category_id
        delete value?.seller_id
        delete value?.seller_picture

        return {
          ...value,
          category: {
            id: categoryId,
            name: categoryName
          },
          seller: {
            id: sellerId,
            name: sellerName,
            picture: sellerPicture
          }
        }
      })
      const transactions = userTransactions.map(value => {
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

      const users = {
        ...result,
        products: products || [],
        transactions: transactions || []
      }

      return response(res, 200, users || {})
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  postUserControllers: async (req, res) => {
    try {
      const data = req.body
      const bodyLength = Object.keys(data).length
      const user = await getUserByIdModels(false, [data.email], 'email = $1')
      const file = req.files?.thumbnail || {}
      let queryAdditionalDatabase = ''
      let queryValueDatabase = ''
      let result = ''

      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')
      if (user) throw new createErrors.Conflict('Account has been registered!')

      const hashPassword = await argon2.hash(data.password, { type: argon2.argon2id })

      if (file.length) {
        cloudinary.v2.config({ secure: true })

        const uploadedPicture = await cloudinary.v2.uploader.upload(file[0].path, {
          use_filename: false,
          unique_filename: true,
          overwrite: true
        })

        data.image = uploadedPicture.secure_url || ''
      }

      if (data?.role) {
        queryAdditionalDatabase = '(name, email, password, picture, role) VALUES($1, $2, $3, $4, $5)'
        queryValueDatabase = [
          data.name,
          data.email,
          hashPassword,
          data.image,
          data.role
        ]

        result = await postUserModels(false, queryValueDatabase, queryAdditionalDatabase)
      } else {
        queryValueDatabase = [
          data.name,
          data.email,
          hashPassword,
          data.image
        ]

        result = await postUserModels(false, queryValueDatabase)
      }

      if (!result) throw new createErrors.NotImplemented('Registration failed!')

      return response(res, 201, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  putUserControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length
      const data = req.body
      const file = req.files?.thumbnail || {}

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const user = await getUserByIdModels(false, [params.id], 'id = $1')

      if (!user) throw new createErrors.ExpectationFailed('Unregistered account!')

      if (data?.password) {
        const hashPassword = await argon2.hash(data.password, { type: argon2.argon2id })
        data.password = hashPassword
      }

      if (file.length) {
        cloudinary.v2.config({ secure: true })

        const uploadedPicture = await cloudinary.v2.uploader.upload(file[0].path, {
          use_filename: false,
          unique_filename: true,
          overwrite: true
        })

        data.picture = uploadedPicture.secure_url || ''
      }

      const id = params.id
      const queryDatabase = queryWithKey(id, 'UPDATE users', 'SET', data)
      const queryValueDatabase = queryWithValue(data)
      const result = await putUserModels(queryDatabase, queryValueDatabase)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  deleteUserControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.id
      const queryValueDatabaseDatabase = [id]
      const result = await deleteUserModels(false, queryValueDatabaseDatabase)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  }
}
