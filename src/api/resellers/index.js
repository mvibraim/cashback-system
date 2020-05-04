import { Router } from 'express'
import { indexResellers, createReseller, validateReseller } from './controller'
import { indexPurchases, createPurchase, validatePurchase } from './purchases/controller'

const resellersRouter = new Router()

resellersRouter.get('/', indexResellers)
resellersRouter.post('/', validateReseller('create'), createReseller)

resellersRouter.get('/:cpf/purchases', indexPurchases)
// resellersRouter.post('/:cpf/purchases', validatePurchase('create'), createPurchase)
resellersRouter.post('/:cpf/purchases', createPurchase)

export default resellersRouter
