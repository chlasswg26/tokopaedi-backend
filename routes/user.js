const express = require('express')
const Route = express.Router()

const {
  getAllUserControllers,
  getUserControllersById,
  postUserControllers,
  putUserControllers,
  deleteUserControllers
} = require('../controllers/user')

Route
  .get('/', getAllUserControllers)
  .get('/:id', getUserControllersById)
  .post('/', postUserControllers)
  .put('/:id', putUserControllers)
  .delete('/:id', deleteUserControllers)

module.exports = Route
