const {
  getProfileModels,
  putProfileModels
} = require('../models/profile')
const response = require('../helpers/response')
const createErrors = require('http-errors')
const argon2 = require('argon2')
const cloudinary = require('cloudinary')
const { getAllProductModels } = require('../models/product')
const { getAllTransactionModels } = require('../models/transaction')
const { queryWithKey, queryWithValue } = require('../helpers/common')
const { getUserByIdModels } = require('../models/user')

module.exports = {
  getProfileControllers: async (req, res) => {
    try {
      const user = req.userData

      const id = user?.id
      const queryValueDatabaseDatabase = [user?.id]
      const result = await getProfileModels(false, queryValueDatabaseDatabase)
      const userProducts = await getAllProductModels(
        false,
        [id],
        'products.seller_id = $1'
      )
      const userTransactions = await getAllTransactionModels(
        false,
        [id],
        'A.buyer_id = $1'
      )

      delete result.password
      delete result.refresh_token
      delete result.verification_code

      const products = userProducts.map((value) => {
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
      const transactions = userTransactions.map((value) => {
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
  putProfileControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length
      const data = req.body
      const file = req.files?.picture || {}

      if (!paramsLength) {
        throw new createErrors.BadRequest('Request parameters empty!')
      }

      const user = await getUserByIdModels(false, [params.id], 'id = $1')

      if (!user) {
        throw new createErrors.ExpectationFailed('Unregistered account!')
      }

      if (data?.password) {
        const hashPassword = await argon2.hash(data.password, {
          type: argon2.argon2id
        })
        data.password = hashPassword
      }

      if (file.length) {
        cloudinary.v2.config({ secure: true })

        const uploadedPicture = await cloudinary.v2.uploader.upload(
          file[0].path,
          {
            use_filename: false,
            unique_filename: true,
            overwrite: true
          }
        )

        data.picture = uploadedPicture.secure_url || ''
      }

      const id = params.id
      const queryDatabase = queryWithKey(id, 'UPDATE users', 'SET', data)
      const queryValueDatabase = queryWithValue(data)
      const result = await putProfileModels(queryDatabase, queryValueDatabase)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  }
}
