const express = require('express')
const Route = express.Router()

// const productRoutes = require('./product')
// const categoryRoutes = require('./category')
// const transactionRoutes = require('./transaction')
// const userRoutes = require('./user')

const authRoutes = require('./auth')

Route
  // .use('/products', productRoutes)
  // .use('/categories', categoryRoutes)
  // .use('/transactions', transactionRoutes)
  // .use('/users', userRoutes)
  .use('/auth', authRoutes)

module.exports = Route
