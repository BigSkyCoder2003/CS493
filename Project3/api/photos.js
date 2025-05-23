const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const Photo = require('../models/photo');
const { getNextSequenceValue } = require('../lib/idGenerator');
const { requireAuth } = require('../lib/auth');

exports.router = router;

/*
 * Schema describing required/optional fields of a photo object.
 */
const photoSchema = {
  id: {required: false},
  userid: { required: true },
  businessid: { required: true },
  caption: { required: false }
};


/*
 * Route to create a new photo.
 */
router.post('/', requireAuth, async function (req, res, next) {
  if (validateAgainstSchema(req.body, photoSchema)) {
    const photo = extractValidFields(req.body, photoSchema);
    try {
      if (!req.body.id) {
        photo.id = await getNextSequenceValue('photoId');
      } else {
        const existingPhoto = await Photo.findOne({ id: req.body.id });
        if (existingPhoto) {
          return res.status(400).json({
            error: "A photo with the specified ID already exists."
          });
        }
        photo.id = req.body.id;
      }

      const newPhoto = new Photo(photo);
      await newPhoto.save();
      res.status(201).json({
        id: newPhoto.id,
        links: {
          photo: `/photos/${newPhoto.id}`,
          business: `/businesses/${newPhoto.businessid}`
        }
      });
    } catch (err) {
      if (err.code === 11000) {
        res.status(400).json({
          error: "A photo with the specified ID already exists."
        });
      } else {
        console.error(err);
        res.status(500).json({ error: "Error creating photo." });
      }
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to fetch info about a specific photo.
 */
router.get('/:photoID', async function (req, res, next) {
  const photoID = parseInt(req.params.photoID);
  try {
    const photo = await Photo.findOne({ id: photoID });
    if (photo) {
      res.status(200).json(photo);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching photo." });
  }
});

/*
 * Route to update a photo.
 */
router.put('/:photoID', requireAuth, async function (req, res, next) {
  const photoID = parseInt(req.params.photoID);
  if (validateAgainstSchema(req.body, photoSchema)) {
    try {
      const updatedPhoto = await Photo.findOneAndUpdate(
        { id: photoID },
        extractValidFields(req.body, photoSchema),
        { new: true }
      );
      if (updatedPhoto) {
        res.status(200).json({
          links: {
            photo: `/photos/${photoID}`,
            business: `/businesses/${updatedPhoto.businessid}`
          }
        });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating photo." });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid photo object"
    });
  }
});

/*
 * Route to delete a photo.
 */
router.delete('/:photoID', requireAuth, async function (req, res, next) {
  const photoID = parseInt(req.params.photoID);
  try {
    const deletedPhoto = await Photo.findOneAndDelete({ id: photoID });
    if (deletedPhoto) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting photo." });
  }
});