const express = require('express')
const Route = express.Router()

const {
  getAllTransactionControllers,
  getTransactionControllersById,
  postTransactionControllers,
  putTransactionControllers,
  deleteTransactionControllers
} = require('../controllers/transaction')

Route
  .get('/', getAllTransactionControllers)
  .get('/:id', getTransactionControllersById)
  .post('/', postTransactionControllers)
  .put('/:id', putTransactionControllers)
  .delete('/:id', deleteTransactionControllers)

module.exports = Route
