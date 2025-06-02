const router = require('express').Router();
const Business = require('../models/business');
const Review = require('../models/review');
const Photo = require('../models/photo');

exports.router = router;

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', async function (req, res) {
  const userid = parseInt(req.params.userid);
  try {
    const userBusinesses = await Business.find({ ownerid: userid });
    res.status(200).json({
      businesses: userBusinesses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user's businesses." });
  }
});

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userid/reviews', async function (req, res) {
  const userid = parseInt(req.params.userid);
  try {
    const userReviews = await Review.find({ userid: userid });
    res.status(200).json({
      reviews: userReviews
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user's reviews." });
  }
});

/*
 * Route to list all of a user's photos.
 */
router.get('/:userid/photos', async function (req, res) {
  const userid = parseInt(req.params.userid);
  try {
    const userPhotos = await Photo.find({ userid: userid });
    res.status(200).json({
      photos: userPhotos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user's photos." });
  }
});