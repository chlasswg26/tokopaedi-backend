const express = require('express')
const Route = express.Router()

const productRoutes = require('./product')

Route
  .use('/products', productRoutes)

module.exports = Route
