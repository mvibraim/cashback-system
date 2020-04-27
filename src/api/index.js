const { Router } = require('express')
const resellers = require('./resellers')

const router = new Router()

router.use('/resellers', resellers)

module.exports = router
