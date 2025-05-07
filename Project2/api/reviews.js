const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const Review = require('../models/review');
const { getNextSequenceValue } = require('../lib/idGenerator');

exports.router = router;

/*
 * Schema describing required/optional fields of a review object.
 */
const reviewSchema = {
  id: {required: false},
  userid: { required: true },
  businessid: { required: true },
  dollars: { required: true },
  stars: { required: true },
  review: { required: false }
};


/*
 * Route to create a new review.
 */
router.post('/', async function (req, res, next) {
  if (validateAgainstSchema(req.body, reviewSchema)) {
    const review = extractValidFields(req.body, reviewSchema);
    try {
      if (!req.body.id) {
        review.id = await getNextSequenceValue('reviewId');
      } else {
        const existingReview = await Review.findOne({ id: req.body.id });
        if (existingReview) {
          return res.status(400).json({
            error: "A review with the specified ID already exists."
          });
        }
        review.id = req.body.id;
      }

      const newReview = new Review(review);
      await newReview.save();
      res.status(201).json({
        id: newReview.id,
        links: {
          review: `/reviews/${newReview.id}`,
          business: `/businesses/${newReview.businessid}`
        }
      });
    } catch (err) {
      if (err.code === 11000) { // Handle duplicate key error
        res.status(400).json({
          error: "A review with the specified ID already exists."
        });
      } else {
        console.error(err);
        res.status(500).json({ error: "Error creating review." });
      }
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to fetch info about a specific review.
 */
router.get('/:reviewID', async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID);
  try {
    const review = await Review.findOne({ id: reviewID });
    if (review) {
      res.status(200).json(review);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching review." });
  }
});

/*
 * Route to update a review.
 */
router.put('/:reviewID', async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID);
  if (validateAgainstSchema(req.body, reviewSchema)) {
    try {
      const updatedReview = await Review.findOneAndUpdate(
        { id: reviewID },
        extractValidFields(req.body, reviewSchema),
        { new: true }
      );
      if (updatedReview) {
        res.status(200).json({
          links: {
            review: `/reviews/${reviewID}`,
            business: `/businesses/${updatedReview.businessid}`
          }
        });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating review." });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid review object"
    });
  }
});

/*
 * Route to delete a review.
 */
router.delete('/:reviewID', async function (req, res, next) {
  const reviewID = parseInt(req.params.reviewID);
  try {
    const deletedReview = await Review.findOneAndDelete({ id: reviewID });
    if (deletedReview) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting review." });
  }
});