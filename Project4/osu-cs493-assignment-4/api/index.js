const { Router } = require('express')

const router = Router()

const photosRouter = require('./photos')

router.use('/businesses', require('./businesses'))
router.use('/photos', photosRouter)
router.use('/media/photos', photosRouter)

module.exports = router
