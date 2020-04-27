const { Router } = require('express')
const { index, create, validate } = require('./controller')

const router = new Router()

router.get('/', index)
router.post('/', validate('create'), create)

module.exports = router
