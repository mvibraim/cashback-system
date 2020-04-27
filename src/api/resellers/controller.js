const { check, validationResult } = require('express-validator')
const { insertReseller, getResellers } = require('./resellers')

const create = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    }
    else {
      const reseller = req.body;
      await insertReseller(reseller);
      res.send({ message: 'New reseller inserted.' })
    }
  } catch (err) {
    return next(err)
  }
}

const index = async (req, res) => {
  res.send(await getResellers());
}

const validate = (method) => {
  switch (method) {
    case 'create': {
      return [
        check('name')
          .exists().withMessage("name required")
          .notEmpty().withMessage("name required"),
        check('cpf')
          .exists().withMessage("cpf required")
          .notEmpty().withMessage("cpf required")
          .isNumeric().withMessage("must be numeric"),
        check('email')
          .exists().withMessage("email required")
          .notEmpty().withMessage("email required")
          .isEmail().withMessage("invalid email"),
        check('password')
          .exists().withMessage("password required")
          .notEmpty().withMessage("password required")
      ]
    }
  }
}

module.exports = {
  create,
  index,
  validate
};
