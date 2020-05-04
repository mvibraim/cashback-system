import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'

export default function (apiRoot, routes) {
  const app = express()

  app.use(helmet());
  app.use(bodyParser.json());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(compression())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(apiRoot, routes)

  app.use((error, req, res, next) => {
    res.status(error.status)
    res.json({ error: error.message, status: error.status })
  })

  return app
}
