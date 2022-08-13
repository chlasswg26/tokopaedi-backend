const { validationResult } = require('express-validator')
const response = require('../helpers/response')

const validate = validations => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req)

      if (result.errors.length) break
    }

    const errors = validationResult(req)

    if (errors.isEmpty()) return next()

    return response(res, 400, {
      message: errors.array({ onlyFirstError: true })[0]
    })
  }
}

module.exports = validate
