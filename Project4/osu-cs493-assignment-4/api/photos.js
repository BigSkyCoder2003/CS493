/*
 * API sub-router for photos collection endpoints.
 */

const { Router } = require('express')
const multer = require('multer')

const { validateAgainstSchema } = require('../lib/validation')
const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById,
  validatePhotoType,
  getPhotoDownloadStream
} = require('../models/photo')

const router = Router()

function getPhotoPath(photo) {
  const extension = photo.contentType === 'image/png' ? 'png' : 'jpg'
  return `/media/photos/${photo._id}.${extension}`
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

/*
 * POST /photos - Route to create a new photo.
 */
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).send({
      error: "No file uploaded"
    })
    return
  }

  if (!validatePhotoType(req.file.mimetype)) {
    res.status(400).send({
      error: "Invalid file type. Only JPEG and PNG files are accepted."
    })
    return
  }

  try {
    const photo = {
      businessId: req.body.businessId,
      caption: req.body.caption
    }

    const RequestPhotoSchema = {
      businessId: { required: true },
      caption: { required: false }
    }

    if (validateAgainstSchema(photo, RequestPhotoSchema)) {
      const savedPhoto = await insertNewPhoto(photo, req.file)
      const downloadPath = getPhotoPath(savedPhoto)
      res.status(201).send({
        id: savedPhoto._id,
        links: {
          photo: `/photos/${savedPhoto._id}`,
          business: `/businesses/${photo.businessId}`,
          download: downloadPath
        }
      })
    } else {
      res.status(400).send({
        error: "Request body is not a valid photo object"
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Error inserting photo into DB. Please try again later."
    })
  }
})

/*
 * GET /photos/{id} - Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const photo = await getPhotoById(req.params.id)
    if (photo) {
      const photoWithPath = {
        ...photo,
        path: getPhotoPath(photo)
      }
      res.status(200).send(photoWithPath)
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo. Please try again later."
    })
  }
})

/*
 * GET /:id.:ext - Route to download a photo.
 */
router.get('/:id.:ext', async (req, res, next) => {
  try {
    const photo = await getPhotoById(req.params.id)
    if (!photo) {
      next()
      return
    }

    const requestedExt = req.params.ext.toLowerCase()
    const actualExt = photo.contentType === 'image/png' ? 'png' : 'jpg'
    if (requestedExt !== actualExt) {
      next()
      return
    }

    const downloadStream = await getPhotoDownloadStream(req.params.id)
    if (downloadStream) {
      res.set('Content-Type', photo.contentType)
      
      downloadStream.on('error', (error) => {
        console.error('Download stream error:', error)
        if (!res.headersSent) {
          res.status(500).send({ error: 'Error downloading photo' })
        }
      })
      
      downloadStream.pipe(res)
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to download photo. Please try again later."
    })
  }
})

module.exports = router
