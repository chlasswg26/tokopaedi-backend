const express = require('express')
const Route = express.Router()

const categoryRoutes = require('./category')
const productRoutes = require('./product')
const transactionRoutes = require('./transaction')
const userRoutes = require('./user')

const authRoutes = require('./auth')

Route
  .use('/categories', categoryRoutes)
  .use('/products', productRoutes)
  .use('/transactions', transactionRoutes)
  .use('/users', userRoutes)
  .use('/auth', authRoutes)

module.exports = Route
