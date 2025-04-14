// Some repetitive code such as fake data and commmon error handling was generated with Github Copilot

const express = require('express');
const app = express();

app.use(express.json());

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Simulated in-memory data
const businesses = ['Test Business'];
const reviews = ['1'];
const photos = ['1'];

// --- BUSINESSES ---

// POST /businesses
app.post('/businesses', (req, res) => {
  const { business_name, street_address, city, state, zip, phone_number, category, subcategory } = req.body;
  if (!business_name || !street_address || !city || !state || !zip || !phone_number || !category || !subcategory) {
    return res.status(400).send({ error: 'Missing required fields' });
  }
  businesses.push(business_name);
  res.status(201).send(req.body);
});

// GET /businesses
app.get('/businesses', (req, res) => {
  const dummyBusinesses = [
    {
      business_name: 'Test Business',
      street_address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zip: 12345,
      phone_number: '123-456-7890',
      category: 'Restaurant',
      subcategory: 'Pizza',
      website: 'http://example.com',
      email: 'test@example.com',
    },
  ];
  res.status(200).send(dummyBusinesses);
});

// GET /businesses/:name
app.get('/businesses/:name', (req, res) => {
  const businessName = req.params.name;
  if (!businesses.includes(businessName)) {
    return res.status(404).send({ error: `Business '${businessName}' not found.` });
  }
  const dummyBusiness = {
    business_name: businessName,
    street_address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zip: 12345,
    phone_number: '123-456-7890',
    category: 'Restaurant',
    subcategory: 'Pizza',
    website: 'http://example.com',
    email: 'test@example.com',
    reviews: [],
    photos: [],
  };
  res.status(200).send(dummyBusiness);
});

// PATCH /businesses/:name
app.patch('/businesses/:name', (req, res) => {
  const businessName = req.params.name;
  if (!businesses.includes(businessName)) {
    return res.status(404).send({ error: `Business '${businessName}' not found.` });
  }
  res.status(200).send({ businessName, updates: req.body });
});

// DELETE /businesses/:name
app.delete('/businesses/:name', (req, res) => {
  const businessName = req.params.name;
  if (!businesses.includes(businessName)) {
    return res.status(404).send({
      error: `Business '${businessName}' not found.`,
      links: {
        allBusinesses: { href: '/businesses', method: 'GET' },
        createBusiness: { href: '/businesses', method: 'POST' },
      },
    });
  }
  businesses.splice(businesses.indexOf(businessName), 1);
  res.status(200).send({
    message: `Business '${businessName}' has been deleted.`,
    links: {
      allBusinesses: { href: '/businesses', method: 'GET' },
      createBusiness: { href: '/businesses', method: 'POST' },
    },
  });
});

// --- REVIEWS ---

// POST /reviews
app.post('/reviews', (req, res) => {
  const { business_name, star, dollar_sign_rating, review } = req.body;
  if (!business_name || star == null || dollar_sign_rating == null) {
    return res.status(400).send({ error: 'Missing required fields' });
  }
  res.status(201).send(req.body);
});

// GET /reviews
app.get('/reviews', (req, res) => {
  const dummyReviews = [
    {
      business_name: 'Test Business',
      star: 5,
      dollar_sign_rating: 3,
      review: 'Great place!',
    },
  ];
  res.status(200).send(dummyReviews);
});

// PATCH /reviews/:review_id
app.patch('/reviews/:review_id', (req, res) => {
  const reviewId = req.params.review_id;
  if (!reviews.includes(reviewId)) {
    return res.status(404).send({ error: `Review '${reviewId}' not found.` });
  }
  res.status(200).send({ reviewId, updates: req.body });
});

// DELETE /reviews/:review_id
app.delete('/reviews/:review_id', (req, res) => {
  const reviewId = req.params.review_id;
  if (!reviews.includes(reviewId)) {
    return res.status(404).send({
      error: `Review '${reviewId}' not found.`,
      links: {
        allReviews: { href: '/reviews', method: 'GET' },
        createReview: { href: '/reviews', method: 'POST' },
      },
    });
  }
  reviews.splice(reviews.indexOf(reviewId), 1);
  res.status(200).send({
    message: `Review '${reviewId}' has been deleted.`,
    links: {
      allReviews: { href: '/reviews', method: 'GET' },
      createReview: { href: '/reviews', method: 'POST' },
    },
  });
});

// --- PHOTOS ---

// POST /photos
app.post('/photos', (req, res) => {
  const { business_name, photo_file, caption } = req.body;
  if (!business_name || !photo_file) {
    return res.status(400).send({ error: 'Missing required fields' });
  }
  res.status(201).send(req.body);
});

// GET /photos
app.get('/photos', (req, res) => {
  const dummyPhotos = [
    {
      business_name: 'Test Business',
      photo_url: 'http://example.com/photo.jpg',
      caption: 'A great photo!',
    },
  ];
  res.status(200).send(dummyPhotos);
});

// PATCH /photos/:photo_id
app.patch('/photos/:photo_id', (req, res) => {
  const photoId = req.params.photo_id;
  if (!photos.includes(photoId)) {
    return res.status(404).send({ error: `Photo '${photoId}' not found.` });
  }
  res.status(200).send({ photoId, updates: req.body });
});

// DELETE /photos/:photo_id
app.delete('/photos/:photo_id', (req, res) => {
  const photoId = req.params.photo_id;
  if (!photos.includes(photoId)) {
    return res.status(404).send({
      error: `Photo '${photoId}' not found.`,
      links: {
        allPhotos: { href: '/photos', method: 'GET' },
        createPhoto: { href: '/photos', method: 'POST' },
      },
    });
  }
  photos.splice(photos.indexOf(photoId), 1);
  res.status(200).send({
    message: `Photo '${photoId}' has been deleted.`,
    links: {
      allPhotos: { href: '/photos', method: 'GET' },
      createPhoto: { href: '/photos', method: 'POST' },
    },
  });
});