const { Router } = require('express')
const { index, create } = require('./controller')

const router = new Router()

router.get('/', index)
router.post('/', create)

module.exports = router
