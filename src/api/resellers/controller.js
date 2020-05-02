import { check, validationResult } from 'express-validator'
import { insertReseller, getResellers } from './resellers'
import { listResellerView, resellerView } from '../../services/views/reseller'

const create = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res
        .status(422)
        .json({ errors: errors.array() });
    }
    else {
      const inserted_reseller = await insertReseller(req.body);
      res.json(resellerView(inserted_reseller))
    }
  } catch (err) {
    next(err)
  }
}

const index = async (req, res, next) => {
  try {
    const response = listResellerView(await getResellers(req))
    res.json(response);
  } catch (err) {
    next(err)
  }
}

const validate = (method) => {
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

export { create, index, validate }
