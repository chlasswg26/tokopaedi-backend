const {
  getAllProductModels,
  getProductByIdModels,
  postProductModels,
  putProductModels,
  deleteProductModels
} = require('../models/product')
const response = require('../helpers/response')
const createErrors = require('http-errors')
const cloudinary = require('cloudinary')
const { queryWithKey, queryWithValue, mappingKey } = require('../helpers/common')
const { decrypt } = require('../helpers/cryptography')
const { getUserByIdModels } = require('../models/user')
const setter = require('../helpers/setter')
const redisClient = require('../config/redis')
require('dotenv').config()
const { REDIS_CACHE_LIFE } = process.env

module.exports = {
  getAllProductControllers: async (req, res) => {
    try {
      const queryParams = req.query
      let queryDatabase = ''
      let queryAdditionalDatabase = ''
      let result = ''
      let queryForCountRows = ''
      let totalRows = 0

      if (!queryParams) {
        result = await getAllProductModels()

        totalRows = result
      } else {
        if (queryParams?.search) {
          queryAdditionalDatabase = `products.title LIKE '%${queryParams.search}%' OR products.description LIKE '%${queryParams.search}%' OR users.name LIKE '%${queryParams.search}%' OR categories.name LIKE '%${queryParams.search}%'
ORDER BY ${queryParams?.orderBy ? `products.${queryParams?.orderBy}` : 'products.id'} ${queryParams?.sortBy || 'DESC'}`

          queryForCountRows = queryAdditionalDatabase

          queryAdditionalDatabase = `${queryAdditionalDatabase} LIMIT ${parseInt(queryParams?.limit) || 'NULL'} OFFSET ${Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0)}`

          result = await getAllProductModels(false, false, queryAdditionalDatabase)
          totalRows = await getAllProductModels(false, false, queryForCountRows)
        } else {
          queryDatabase = `SELECT products.id, products.title, products.description, products.thumbnail, products.price,
products.seller_id, users.name AS seller, products.category_id AS category_id, categories.name AS category,
products.created_at, products.updated_at FROM products LEFT JOIN users ON products.seller_id = users.id
LEFT JOIN categories ON products.category_id = categories.id ORDER BY ${queryParams?.orderBy ? `products.${queryParams?.orderBy}` : 'products.id'} ${queryParams?.sortBy || 'DESC'}`

          queryForCountRows = queryDatabase

          queryDatabase = `${queryDatabase} LIMIT ${parseInt(queryParams?.limit) || 'NULL'} OFFSET ${Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0)}`

          result = await getAllProductModels(queryDatabase)
          totalRows = await getAllProductModels(queryForCountRows)
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

      const products = result.map(value => {
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

      const {
        redisKey,
        redisData,
        cacheLife
      } = {
        redisKey: `product:${mappingKey(req.query)}`,
        redisData: {
          data: result ? products : [],
          pagination
        },
        cacheLife: REDIS_CACHE_LIFE
      }

      await setter(
        redisKey,
        redisData,
        cacheLife
      )

      return response(res, 200, result ? products : [], pagination)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  getProductControllersById: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.id
      const queryValueDatabase = [id]
      const result = await getProductByIdModels(false, queryValueDatabase)

      const product = {
        ...result,
        category: {
          id: result?.category_id,
          name: result?.category
        },
        seller: {
          id: result?.seller_id,
          name: result?.seller,
          picture: result?.seller_picture
        }
      }

      delete product?.category_id
      delete product?.seller_id
      delete product?.seller_picture

      const {
        redisKey,
        redisData,
        cacheLife
      } = {
        redisKey: `product/${id}`,
        redisData: result ? product : {},
        cacheLife: REDIS_CACHE_LIFE
      }

      await setter(
        redisKey,
        redisData,
        cacheLife
      )

      return response(res, 200, result ? product : {})
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  postProductControllers: async (req, res) => {
    try {
      const data = req.body
      const bodyLength = Object.keys(data).length
      const file = req.files?.thumbnail || {}

      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')

      if (file.length) {
        cloudinary.v2.config({ secure: true })

        const uploadedPicture = await cloudinary.v2.uploader.upload(file[0].path, {
          use_filename: false,
          unique_filename: true,
          overwrite: true
        })

        data.thumbnail = uploadedPicture.secure_url || ''
      }

      const queryValueDatabase = [
        data.title,
        data.description,
        data.thumbnail,
        data.price,
        data.seller_id,
        data.category_id
      ]

      const result = await postProductModels(false, queryValueDatabase)

      return response(res, 201, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  putProductControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length
      const data = req.body
      const file = req.files?.thumbnail || {}

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      if (file.length) {
        cloudinary.v2.config({ secure: true })

        const uploadedPicture = await cloudinary.v2.uploader.upload(file[0].path, {
          use_filename: false,
          unique_filename: true,
          overwrite: true
        })

        data.thumbnail = uploadedPicture.secure_url || ''
      }

      const id = req.params.id
      const refreshToken = req.signedCookies?.token
      const decryptionTokenFromSignedCookie = decrypt(13, refreshToken)
      const user = await getUserByIdModels(false, [req.userData?.email, decryptionTokenFromSignedCookie], 'email = $1 AND refresh_token = $2')
      const prefix = req.userData?.role === 'admin' ? false : `AND seller_id = ${user?.id}`
      const queryDatabase = queryWithKey(id, 'UPDATE products', 'SET', data, prefix)
      const queryValueDatabase = queryWithValue(data)
      const result = await putProductModels(queryDatabase, queryValueDatabase)

      const product = await getProductByIdModels(false, [id])
      const getCacheProductById = await redisClient.get(`product/${product.id}`)

      if (getCacheProductById) {
        const {
          redisKey,
          redisData,
          cacheLife
        } = {
          redisKey: `product/${product?.id}`,
          redisData: result ? product : {},
          cacheLife: REDIS_CACHE_LIFE
        }

        await setter(
          redisKey,
          redisData,
          cacheLife
        )
      }

      return response(res, 200, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  deleteProductControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.id
      const refreshToken = req.signedCookies?.token
      const decryptionTokenFromSignedCookie = decrypt(13, refreshToken)
      const user = await getUserByIdModels(false, [req.userData?.email, decryptionTokenFromSignedCookie], 'email = $1 AND refresh_token = $2')
      const queryDatabase = req.userData?.role === 'admin' ? 'DELETE FROM products WHERE id = $1' : 'DELETE FROM products WHERE id = $1 AND buyer_id = $2'
      const queryValueDatabase = req.userData?.role === 'admin' ? [id] : [id, user?.id]
      const result = await deleteProductModels(queryDatabase, queryValueDatabase)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  }
}
