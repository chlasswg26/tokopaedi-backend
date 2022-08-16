const express = require('express')
const Route = express.Router()
const { query, param, check } = require('express-validator')

const {
  getAllUserControllers,
  getUserControllersById,
  postUserControllers,
  putUserControllers,
  deleteUserControllers
} = require('../controllers/user')
const { grantedAll, grantedOnlyAdmin } = require('../middlewares/authorization')
const { multerHandler } = require('../middlewares/upload')
const validate = require('../middlewares/validation')
const { verifyToken } = require('../middlewares/verify')

Route
  .get('/', validate([
    query('search').escape().trim(),
    query('limit').escape().trim().toInt(),
    query('page').escape().trim().toInt()
  ]), verifyToken, grantedOnlyAdmin, getAllUserControllers)
  .get('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('User ID can\'t be empty').bail().isNumeric().withMessage('User ID must be numeric').bail().toInt()
  ]), verifyToken, grantedAll, getUserControllersById)
  .post('/', multerHandler, validate([
    check('name').escape().trim().notEmpty().withMessage('User name can\'t be empty'),
    check('email').escape().trim().notEmpty().withMessage('E-mail address can\'t be empty').bail().isEmail().withMessage('E-mail bad format'),
    check('password').escape().trim().notEmpty().withMessage('Password can\'t be empty').bail().isLength({
      min: 8
    }).withMessage('Password too short, min 8 character'),
    check('role').escape().trim().isIn(['buyer', 'seller', 'admin']).withMessage('Invalid role!')
  ]), verifyToken, grantedOnlyAdmin, postUserControllers)
  .put('/:id', multerHandler, validate([
    param('id').escape().trim().notEmpty().withMessage('User ID can\'t be empty').bail().isNumeric().withMessage('User ID must be numeric').bail().toInt(), check('name').escape().trim().notEmpty().withMessage('User name can\'t be empty'),
    check('name').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('User name can\'t be empty'),
    check('email').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('E-mail address can\'t be empty').bail().isEmail().withMessage('E-mail bad format'),
    check('password').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('Password can\'t be empty').bail().isLength({
      min: 8
    }).withMessage('Password too short, min 8 character'),
    check('role').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().isIn(['buyer', 'seller', 'admin']).withMessage('Invalid role!')
  ]), verifyToken, grantedAll, putUserControllers)
  .delete('/:id', validate([
    param('id').escape().trim().notEmpty().withMessage('User ID can\'t be empty').bail().isNumeric().withMessage('User ID must be numeric').bail().toInt()
  ]), verifyToken, grantedOnlyAdmin, deleteUserControllers)

module.exports = Route
