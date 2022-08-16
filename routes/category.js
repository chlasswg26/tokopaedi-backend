const express = require('express')
const Route = express.Router()
const { query, param, check } = require('express-validator')

const {
  getAllCategoryControllers,
  getCategoryControllersById,
  postCategoryControllers,
  putCategoryControllers,
  deleteCategoryControllers
} = require('../controllers/category')
const { grantedOnlyAdmin } = require('../middlewares/authorization')
const validate = require('../middlewares/validation')
const { verifyToken } = require('../middlewares/verify')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), getAllCategoryControllers)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Category ID can\'t be empty').bail().isNumeric().withMessage('Category ID must be numeric').bail().toInt()
  ]), getCategoryControllersById)
  .post('/', validate([
    check('name').escape().trim().notEmpty().withMessage('Category name can\'t be empty')
  ]), verifyToken, grantedOnlyAdmin, postCategoryControllers)
  .put('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Category ID can\'t be empty').bail().isNumeric().withMessage('Category ID must be numeric').bail().toInt(),
    check('name').escape().trim().notEmpty().withMessage('Category name can\'t be empty')
  ]), verifyToken, grantedOnlyAdmin, putCategoryControllers)
  .delete('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Category ID can\'t be empty').bail().isNumeric().withMessage('Category ID must be numeric').bail().toInt()
  ]), verifyToken, grantedOnlyAdmin, deleteCategoryControllers)

module.exports = Route
