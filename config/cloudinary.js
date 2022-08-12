const cloudinary = require('cloudinary').v2

module.exports = cloudinary.config({
  secure: true
})
