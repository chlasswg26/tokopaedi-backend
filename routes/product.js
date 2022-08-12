const express = require('express')
const Route = express.Router()

const {
  getAllProductControllers,
  getProductControllersById,
  postProductControllers,
  putProductControllers,
  deleteProductControllers
} = require('../controllers/product')

Route
  .get('/', getAllProductControllers)
  .get('/:id', getProductControllersById)
  .post('/', postProductControllers)
  .put('/:id', putProductControllers)
  .delete('/:id', deleteProductControllers)

module.exports = Route
