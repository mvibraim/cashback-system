import { check, validationResult } from 'express-validator'
import { insertPurchase, getPurchases } from './purchases'
import { listPurchaseView, purchaseView } from '../../../services/views/purchase'

const createPurchase = async (req, res, next) => {
  try {
    const inserted_purchase = await insertPurchase(req.body, req.params.cpf);
    res.json(purchaseView(inserted_purchase))
  } catch (err) {
    next(err)
  }
}

const indexPurchases = async (req, res, next) => {
  try {
    const response = await getPurchases(req)
    res.json(listPurchaseView(response));
  } catch (err) {
    next(err)
  }
}

const validatePurchase = (method) => {
  switch (method) {
    case 'create': {
      return [
        check('full_name')
          .exists().withMessage("full_name required")
          .notEmpty().withMessage("full_name required")
          .isString().withMessage("must be string"),
        check('cpf')
          .exists().withMessage("cpf required")
          .notEmpty().withMessage("cpf required")
          .isString().withMessage("must be string")
          .isNumeric().withMessage("must be numeric"),
        check('email')
          .exists().withMessage("email required")
          .notEmpty().withMessage("email required")
          .isString().withMessage("must be string")
          .isEmail().withMessage("invalid email"),
        check('password')
          .exists().withMessage("password required")
          .notEmpty().withMessage("password required")
          .isString().withMessage("must be string")
      ]
    }
  }
}

export { createPurchase, indexPurchases, validatePurchase }
