const router = require('express').Router();
const { validateAgainstSchema, extractValidFields } = require('../lib/validation');
const { getNextSequenceValue } = require('../lib/idGenerator');
const { requireAuth } = require('../lib/auth');

const Business = require('../models/business');
const Review = require('../models/review');
const Photo = require('../models/photo');

exports.router = router;

/*
 * Schema describing required/optional fields of a business object.
 */
const businessSchema = {
  id: {required: false},
  ownerid: { required: true },
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  phone: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
};

/*
 * Route to return a list of businesses.
 */
router.get('/', async function (req, res) {
  console.log("got here");

  /*
   * Compute page number based on optional query string parameter `page`.
   * Make sure page is within allowed bounds.
   */
  let page = parseInt(req.query.page) || 1;
  const numPerPage = 10;
  const totalBusinesses = await Business.countDocuments();
  const lastPage = Math.ceil(totalBusinesses / numPerPage);

  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;

  /*
   * Calculate starting and ending indices of businesses on requested page and
   * slice out the corresponsing sub-array of businesses.
   */

  const start = (page - 1) * numPerPage;
  const pageBusinesses = await Business.find().skip(start).limit(numPerPage);

  /*
   * Generate HATEOAS links for surrounding pages.
   */
  const links = {};
  if (page < lastPage) {
    links.nextPage = `/businesses?page=${page + 1}`;
    links.lastPage = `/businesses?page=${lastPage}`;
  }
  if (page > 1) {
    links.prevPage = `/businesses?page=${page - 1}`;
    links.firstPage = '/businesses?page=1';
  }

  /*
   * Construct and send response.
   */
  res.status(200).json({
    businesses: pageBusinesses,
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: totalBusinesses,
    links: links
  });

});

/*
 * Route to create a new business.
 */
router.post('/', requireAuth, async function (req, res, next) {
  if (validateAgainstSchema(req.body, businessSchema)) {
    const business = extractValidFields(req.body, businessSchema);
    try {
      if (!req.body.id) {
        business.id = await getNextSequenceValue('businessId');
      } else {
        const existingBusiness = await Business.findOne({ id: req.body.id });
        if (existingBusiness) {
          return res.status(409).json({
            error: "A business with the specified ID already exists."
          });
        }
        business.id = req.body.id;
      }

      const newBusiness = new Business(business);
      await newBusiness.save();
      res.status(201).json({
        id: newBusiness.id,
        links: {
          business: `/businesses/${newBusiness.id}`
        }
      });
    } catch (err) {
      console.log(`TESTTESTTEST ${business.id} and ${business.ownerid}`);
      if (err.code === 11000) {
        res.status(400).json({
          error: "A business with the specified ID already exists."
        });
      } else {
        console.error(err);
        res.status(500).json({ error: "Error creating business." });
      }
    }
  } else {
    console.log("TESTTESTTEST");
    res.status(400).json({
      error: "Request body is not a valid business object"
    });
  }
});

/*
 * Route to fetch info about a specific business.
 */
router.get('/:businessid', async function (req, res, next) {
  const businessid = parseInt(req.params.businessid);
  try {
    const business = await Business.findOne({ id: businessid });
    if (business) {
      const reviews = await Review.find({ businessid: businessid });
      const photos = await Photo.find({ businessid: businessid });

      const businessData = {
        ...business.toObject(),
        reviews: reviews,
        photos: photos
      };

      res.status(200).json(businessData);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching business." });
  }
});

/*
 * Route to replace data for a business.
 */
router.put('/:businessid', requireAuth, async function (req, res, next) {
  const businessid = parseInt(req.params.businessid);
  if (validateAgainstSchema(req.body, businessSchema)) {
    try {
      const updatedBusiness = await Business.findOneAndUpdate(
        { id: businessid },
        extractValidFields(req.body, businessSchema),
        { new: true }
      );
      if (updatedBusiness) {
        res.status(200).json({
          links: {
            business: `/businesses/${businessid}`
          }
        });
      } else {
        next();
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error updating business." });
    }
  } else {
    res.status(400).json({
      error: "Request body is not a valid business object"
    });
  }
});

/*
 * Route to delete a business.
 */
router.delete('/:businessid', requireAuth, async function (req, res, next) {
  const businessid = parseInt(req.params.businessid);
  try {
    const deletedBusiness = await Business.findOneAndDelete({ id: businessid });
    if (deletedBusiness) {
      res.status(204).end();
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting business." });
  }
});