const express = require('express')
const Route = express.Router()
const { query, param, check } = require('express-validator')

const {
  getAllProductControllers,
  getProductControllersById,
  postProductControllers,
  putProductControllers,
  deleteProductControllers
} = require('../controllers/product')
const { grantedSellerAndAdmin } = require('../middlewares/authorization')
const {
  cacheAllProducts,
  cacheSingleProduct,
  removeCacheAllProduct,
  removeCacheSingleProduct
} = require('../middlewares/cache')
const { multerHandler } = require('../middlewares/upload')
const validate = require('../middlewares/validation')
const { verifyToken } = require('../middlewares/verify')

Route.get(
  '/',
  validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]),
  cacheAllProducts,
  getAllProductControllers
)
  .get(
    '/profile/:store',
    validate([
      query('search').escape().trim(),
      query('limit').escape().trim().toInt(),
      query('page').escape().trim().toInt()
    ]),
    verifyToken,
    grantedSellerAndAdmin,
    getAllProductControllers
  )
  .get(
    '/:id',
    validate([
      param('id')
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Product ID can't be empty")
        .bail()
        .isNumeric()
        .withMessage('Product ID must be numeric')
        .bail()
        .toInt()
    ]),
    cacheSingleProduct,
    getProductControllersById
  )
  .post(
    '/',
    multerHandler,
    validate([
      check('title')
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Product title can't be empty"),
      check('description')
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Product description can't be empty"),
      check('price')
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Price can't be empty")
        .bail()
        .isNumeric()
        .withMessage('Price must be numeric')
        .bail()
        .toInt(),
      check('category_id')
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Category ID's can't be empty")
        .bail()
        .isNumeric()
        .withMessage("Category ID's must be numeric")
        .bail()
        .toInt()
    ]),
    verifyToken,
    grantedSellerAndAdmin,
    removeCacheAllProduct,
    postProductControllers
  )
  .put(
    '/:id',
    multerHandler,
    validate([
      param('id')
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Product ID can't be empty")
        .bail()
        .isNumeric()
        .withMessage('Product ID must be numeric')
        .bail()
        .toInt(),
      check('title')
        .optional({
          nullable: true,
          checkFalsy: true
        })
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Product title can't be empty"),
      check('description')
        .optional({
          nullable: true,
          checkFalsy: true
        })
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Product description can't be empty"),
      check('price')
        .optional({
          nullable: true,
          checkFalsy: true
        })
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Price can't be empty")
        .bail()
        .isNumeric()
        .withMessage('Price must be numeric')
        .bail()
        .toInt(),
      check('category_id')
        .optional({
          nullable: true,
          checkFalsy: true
        })
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Category ID's can't be empty")
        .bail()
        .isNumeric()
        .withMessage("Category ID's must be numeric")
        .bail()
        .toInt()
    ]),
    verifyToken,
    grantedSellerAndAdmin,
    removeCacheSingleProduct,
    removeCacheAllProduct,
    putProductControllers
  )
  .delete(
    '/:id',
    validate([
      param('id')
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Product ID can't be empty")
        .bail()
        .isNumeric()
        .withMessage('Product ID must be numeric')
        .bail()
        .toInt()
    ]),
    verifyToken,
    grantedSellerAndAdmin,
    removeCacheSingleProduct,
    removeCacheAllProduct,
    deleteProductControllers
  )

module.exports = Route
