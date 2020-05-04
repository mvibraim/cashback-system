import { Router } from 'express'
import resellersRouter from './resellers'

const apiRouter = new Router()

apiRouter.use('/resellers', resellersRouter)

apiRouter.get('*', function (req, res) {
  res
    .status(404)
    .json({
      error: "Route not found",
      status: 404
    });
});

export default apiRouter
