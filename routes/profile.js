const express = require('express')
const { param, check } = require('express-validator')
const Route = express.Router()

const {
  getProfileControllers,
  putProfileControllers
} = require('../controllers/profile')
const { grantedAll } = require('../middlewares/authorization')
const { multerHandler } = require('../middlewares/upload')
const validate = require('../middlewares/validation')
const { verifyToken } = require('../middlewares/verify')

Route
  .get('/', verifyToken, grantedAll, getProfileControllers)
  .put('/:id', multerHandler, validate([
    param('id').escape().trim().notEmpty().withMessage('User ID can\'t be empty').bail().isNumeric().withMessage('User ID must be numeric').bail().toInt(),
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
    check('phone').optional({
      nullable: true,
      checkFalsy: true
    }).escape().trim().notEmpty().withMessage('User phone can\'t be empty')
  ]), verifyToken, grantedAll, putProfileControllers)

module.exports = Route
