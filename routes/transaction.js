const express = require('express')
const Route = express.Router()
const { query, param, check } = require('express-validator')

const {
  getAllTransactionControllers,
  getTransactionControllersById,
  postTransactionControllers,
  putTransactionControllers
} = require('../controllers/transaction')
const { grantedAll, grantedSellerAndAdmin } = require('../middlewares/authorization')
const validate = require('../middlewares/validation')
const { verifyToken } = require('../middlewares/verify')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), verifyToken, grantedAll, getAllTransactionControllers)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Transaction ID can\'t be empty').bail().isNumeric().withMessage('Transaction ID must be numeric').bail().toInt()
  ]), verifyToken, grantedAll, getTransactionControllersById)
  .post('/', validate([
    check('buyer_id').escape().trim().notEmpty().withMessage('Buyer ID\'s can\'t be empty').bail().isNumeric().withMessage('Buyer ID\'s must be numeric').bail().toInt(),
    check('product_id').escape().trim().notEmpty().withMessage('Product ID\'s can\'t be empty').bail().isNumeric().withMessage('Product ID\'s must be numeric').bail().toInt(),
    check('quantity').escape().trim().notEmpty().withMessage('Transaction quantity can\'t be empty').bail().isNumeric().withMessage('Transaction quantity must be numeric').bail().isLength({
      min: 1
    }).withMessage('Transaction quantity cannot reduce below 1').toInt(),
    check('price').escape().trim().notEmpty().withMessage('Price can\'t be empty').bail().isNumeric().withMessage('Price must be numeric').bail().toInt()
  ]), verifyToken, grantedAll, postTransactionControllers)
  .put('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('Transaction ID can\'t be empty').bail().isNumeric().withMessage('Transaction ID must be numeric').bail().toInt(),
    check('buyer_id').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('Buyer ID\'s can\'t be empty').bail().isNumeric().withMessage('Buyer ID\'s must be numeric').bail().toInt(),
    check('product_id').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('Product ID\'s can\'t be empty').bail().isNumeric().withMessage('Product ID\'s must be numeric').bail().toInt(),
    check('quantity').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('Transaction quantity can\'t be empty').bail().isNumeric().withMessage('Transaction quantity must be numeric').bail().isLength({
      min: 1
    }).withMessage('Transaction quantity cannot reduce below 1').toInt(),
    check('price').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('Price can\'t be empty').bail().isNumeric().withMessage('Price must be numeric').bail().toInt()
  ]), verifyToken, grantedSellerAndAdmin, putTransactionControllers)

module.exports = Route
