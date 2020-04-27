const http = require('http')
const api = require('./api')
const express = require('./services/express')
const { startDatabase } = require('./services/mongo')

const app = express("", api)
const server = http.createServer(app)
const port = process.env.PORT || 3001
const ip = "0.0.0.0"

setImmediate(() => {
  startDatabase()

  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d', ip, port)
  })
})

module.exports = app