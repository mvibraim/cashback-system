import { Router } from 'express'
import { createReseller, validateReseller } from './controller'
import { indexPurchases, createPurchase, validatePurchase } from './purchases/controller'

const resellersRouter = new Router()

resellersRouter.post('/', validateReseller('create'), createReseller)

resellersRouter.get('/:cpf/purchases', indexPurchases)
resellersRouter.post('/:cpf/purchases', createPurchase)

export default resellersRouter
