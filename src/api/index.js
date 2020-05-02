import { Router } from 'express'
import resellersRouter from './resellers'

const apiRouter = new Router()

apiRouter.use('/resellers', resellersRouter)

export default apiRouter
