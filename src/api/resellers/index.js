import { Router } from 'express'
import { index, create, validate } from './controller'

const resellersRouter = new Router()

resellersRouter.get('/', index)
resellersRouter.post('/', validate('create'), create)

export default resellersRouter
