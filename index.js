const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const xss = require('xss-clean')
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const app = express()
const path = require('node:path')
require('dotenv').config()
const {
  NODE_ENV,
  FRONTEND_URL,
  PORT,
  COOKIE_SECRET_KEY
} = process.env

const routesNavigator = require('./routes/all-routes')

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])
app.use(helmet())
app.use(xss())
app.use(cookieParser(COOKIE_SECRET_KEY))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())
app.use(cors({
  origin: FRONTEND_URL,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: true
}))
app.use(morgan('dev'))

app.use('/api/v1', routesNavigator)

app.listen(PORT, () => {
  if (NODE_ENV === 'development') console.log(`Listen port at ${PORT}`)
})
