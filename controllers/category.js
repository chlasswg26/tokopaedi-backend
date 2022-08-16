const {
  getAllCategoryModels,
  getCategoryByIdModels,
  postCategoryModels,
  putCategoryModels,
  deleteCategoryModels
} = require('../models/category')
const response = require('../helpers/response')
const createErrors = require('http-errors')

module.exports = {
  getAllCategoryControllers: async (req, res) => {
    try {
      const queryParams = req.query
      let queryDatabase = ''
      let queryAdditionalDatabase = ''
      let result = ''
      let queryForCountRows = ''
      let totalRows = 0

      if (!queryParams) {
        result = await getAllCategoryModels()

        totalRows = result
      } else {
        if (queryParams?.search) {
          queryAdditionalDatabase = `name LIKE '%${queryParams.search}%' ORDER BY ${queryParams?.orderBy || 'id'} ${queryParams?.sortBy || 'DESC'}`

          queryForCountRows = queryAdditionalDatabase

          queryAdditionalDatabase = `${queryAdditionalDatabase} LIMIT ${parseInt(queryParams?.limit) || 'NULL'} OFFSET ${Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0)}`

          result = await getAllCategoryModels(false, false, queryAdditionalDatabase)
          totalRows = await getAllCategoryModels(false, false, queryForCountRows)
        } else {
          queryDatabase = `SELECT * FROM categories ORDER BY ${queryParams?.orderBy || 'id'} ${queryParams?.sortBy || 'DESC'}`

          queryForCountRows = queryDatabase

          queryDatabase = `${queryDatabase} LIMIT ${parseInt(queryParams?.limit) || 'NULL'} OFFSET ${Math.max(((parseInt(queryParams?.limit) || 10) * (parseInt(queryParams?.page) || 0)) - (parseInt(queryParams?.limit) || 10), 0)}`

          result = await getAllCategoryModels(queryDatabase)
          totalRows = await getAllCategoryModels(queryForCountRows)
        }
      }

      totalRows = totalRows.length

      const totalActiveRows = result.length
      const sheets = Math.ceil(totalRows / (parseInt(queryParams?.limit) || 0))
      const nextPage = (page, limit, total) => (total / limit) > page ? (limit <= 0 ? false : page + 1) : false
      const previousPage = (page) => page <= 1 ? false : page - 1

      const pagination = {
        total: {
          data: totalRows,
          active: totalActiveRows,
          sheet: sheets === Infinity ? 0 : sheets
        },
        page: {
          limit: parseInt(queryParams?.limit) || 0,
          current: parseInt(queryParams?.page) || 1,
          next: nextPage((parseInt(queryParams?.page) || 1), (parseInt(queryParams?.limit) || 0), totalRows),
          previous: previousPage((parseInt(queryParams?.page) || 1))
        }
      }

      return response(res, 200, result || [], pagination)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  getCategoryControllersById: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.id
      const queryValueDatabaseDatabase = [id]
      const result = await getCategoryByIdModels(false, queryValueDatabaseDatabase)

      return response(res, 200, result || {})
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  postCategoryControllers: async (req, res) => {
    try {
      const data = req.body
      const bodyLength = Object.keys(data).length

      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')

      const newCategory = { name: data.name }

      const queryValueDatabaseDatabase = [newCategory.name]
      const result = await postCategoryModels(false, queryValueDatabaseDatabase)

      return response(res, 201, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  putCategoryControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length
      const data = req.body
      const bodyLength = Object.keys(data).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')
      if (!bodyLength) throw new createErrors.BadRequest('Request body empty!')

      const updateCategory = { name: data.name }

      const id = req.params.id
      const queryValueDatabaseDatabase = [
        updateCategory.name,
        id
      ]
      const result = await putCategoryModels(false, queryValueDatabaseDatabase)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  },
  deleteCategoryControllers: async (req, res) => {
    try {
      const params = req.params
      const paramsLength = Object.keys(params).length

      if (!paramsLength) throw new createErrors.BadRequest('Request parameters empty!')

      const id = req.params.id
      const queryValueDatabaseDatabase = [id]
      const result = await deleteCategoryModels(false, queryValueDatabaseDatabase)

      return response(res, 200, result)
    } catch (error) {
      return response(res, error.status || 500, {
        message: error.message || error
      })
    }
  }
}
