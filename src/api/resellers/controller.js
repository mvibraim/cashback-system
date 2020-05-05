import { check, validationResult } from 'express-validator'
import { insertReseller } from './resellers'
import { resellerView } from '../../services/views/reseller'

const createReseller = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res
        .status(400)
        .json({ validation_errors: errors.array(), message: "Invalid params" });
    }
    else {
      const insertedReseller = await insertReseller(req.body);
      res.json(resellerView(insertedReseller))
    }
  } catch (err) {
    if (err.name == "ResellerWithCPFAlreadyExists") {
      res.status(422).json({ message: err.message })
    }
    else {
      next(err)
    }
  }
}

const validateReseller = (method) => {
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
          .isString().withMessage("must be string"),
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

export { createReseller, validateReseller }
