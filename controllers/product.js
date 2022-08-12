const {
  getAllProductModels,
  getProductModelsById,
  postProductModels,
  putProductModels,
  deleteProductModels
} = require('../models/product')
const response = require('../helpers/response')
const createErrors = require('http-errors')

module.exports = {
  getAllProductControllers: async (_, res) => {
    try {
      const queryDatabase = 'SELECT * FROM products'
      const result = await getAllProductModels(queryDatabase)

      return response(res, 200, result || [])
    } catch (error) {
      return response(res, error?.status || 500, {
        message: error?.message || error
      })
    }
  },
  getProductControllersById: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.id
      const queryDatabase = 'SELECT * FROM products WHERE id = $1'
      const queryValues = [id]
      const result = await getProductModelsById(queryDatabase, queryValues)

      return response(res, 200, result || {})
    } catch (error) {
      return response(res, error?.status || 500, {
        message: error?.message || error
      })
    }
  },
  postProductControllers: async (req, res) => {
    try {
      const body = req.body
      const bodyLength = Object.keys(body).length

      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')

      const newProduct = {
        name: body.name,
        stock: Number(body.stock),
        price: Number(body.price)
      }

      const queryDatabase = 'INSERT INTO products(name, stock, price) VALUES($1, $2, $3)'
      const queryValues = [newProduct.name, newProduct.stock, newProduct.price]
      const result = await postProductModels(queryDatabase, queryValues)

      return response(res, 201, result)
    } catch (error) {
      return response(res, error?.status || 500, {
        message: error?.message || error
      })
    }
  },
  putProductControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length
      const body = req.body
      const bodyLength = Object.keys(body).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')
      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')

      const updateProduct = {
        name: body.name,
        stock: Number(body.stock),
        price: Number(body.price)
      }

      const id = req.params.id
      const queryDatabase = 'UPDATE products SET name = $1, stock = $2, price = $3 WHERE id = $4'
      const queryValues = [
        updateProduct.name,
        updateProduct.stock,
        updateProduct.price,
        id
      ]
      const result = await putProductModels(queryDatabase, queryValues)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error?.status || 500, {
        message: error?.message || error
      })
    }
  },
  deleteProductControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.id
      const queryDatabase = 'DELETE FROM products WHERE id = $1'
      const queryValues = [id]
      const result = await deleteProductModels(queryDatabase, queryValues)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error?.status || 500, {
        message: error?.message || error
      })
    }
  }
}
