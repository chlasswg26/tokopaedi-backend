const multer = require('multer')
const response = require('../helpers/response')
const createErrors = require('http-errors')
const path = require('node:path')
require('dotenv').config()
const { MAX_FILE_SIZE } = process.env

const multerStorage = multer({
  storage: multer.diskStorage({}),
  fileFilter: (_req, file, cb) => {
    const filetypes = /jpg|jpeg|png|svg|gif|webp$i/
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
      cb(null, true)
    } else {
      cb(new createErrors.UnsupportedMediaType('File type not allowed!'), false)
    }
  },
  limits: {
    fileSize: MAX_FILE_SIZE * 1024 * 1024
  }
})

module.exports = {
  multerHandler: (req, res, next) => {
    const upload = multerStorage.fields([
      {
        name: 'thumbnail',
        maxCount: 1
      }
    ])

    upload(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      } else if (error) {
        return response(res, error.status || 500, {
          message: error.message || error
        })
      } else {
        return next()
      }
    })
  }
}
