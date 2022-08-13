const express = require('express')
const Route = express.Router()

const {
  getAllCategoryControllers,
  getCategoryControllersById,
  postCategoryControllers,
  putCategoryControllers,
  deleteCategoryControllers
} = require('../controllers/category')

Route
  .get('/', getAllCategoryControllers)
  .get('/:id', getCategoryControllersById)
  .post('/', postCategoryControllers)
  .put('/:id', putCategoryControllers)
  .delete('/:id', deleteCategoryControllers)

module.exports = Route
