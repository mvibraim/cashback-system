import http from 'http'
import apiRouter from './api'
import expressApp from './services/express'
import { startDatabase } from './services/mongo'

const app = expressApp("", apiRouter)
const server = http.createServer(app)
const port = process.env.PORT || 3001
const ip = "0.0.0.0"

setImmediate(() => {
  startDatabase()

  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d', ip, port)
  })
})
