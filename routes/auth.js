const express = require('express')
const Route = express.Router()
const { check } = require('express-validator')

const {
  registerControllers,
  loginControllers,
  refreshTokenControllers,
  logoutControllers
} = require('../controllers/auth')
const { verifyToken, verifyRefreshToken } = require('../middlewares/verify')
const { multerHandler } = require('../middlewares/upload')
const validate = require('../middlewares/validation')

Route
  .post('/register', multerHandler, validate([
    check('name').escape().trim().default('anonymous'),
    check('email').escape().trim().notEmpty().withMessage('E-mail Can\'t be empty').bail().isEmail().withMessage('E-mail bad format'),
    check('password').escape().trim().notEmpty().withMessage('Password Can\'t be empty').bail().isLength({
      min: 8
    }).withMessage('Password too short, min 8 character'),
    check('role').escape().trim().isIn(['buyer', 'seller', 'admin']).withMessage('Invalid role!')
  ]), registerControllers)
  .post('/login', validate([
    check('email').escape().trim().notEmpty().withMessage('E-mail Can\'t be empty').bail().isEmail().withMessage('E-mail bad format'),
    check('password').escape().trim().notEmpty().withMessage('Password Can\'t be empty').bail().isLength({
      min: 8
    }).withMessage('Password too short, min 8 character')
  ]), loginControllers)
  .get('/refresh-token', verifyRefreshToken, refreshTokenControllers)
  .get('/logout', verifyToken, logoutControllers)

module.exports = Route
