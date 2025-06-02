const router = require('express').Router();
const Business = require('../models/business');
const Review = require('../models/review');
const Photo = require('../models/photo');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { requireAuth, requireAdmin } = require('../lib/auth');

const JWT_SECRET = process.env.JWT_SECRET;
/*
 * Route to create a new user.
 */
router.post('/', async (req, res, next) => {
  if (req.body.admin === true || req.body.admin === 'true') {
    return requireAuth(req, res, () => requireAdmin(req, res, () => createUserHandler(req, res, next)));
  } else {

    return createUserHandler(req, res, next);
  }
});

async function createUserHandler(req, res, next) {
  try {
    const { name, email, password, admin } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const newUser = new User({
      name,
      email,
      password,
      admin: admin || false,
    });

    await newUser.save();

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      admin: newUser.admin,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    console.error("== Error creating user:", err);
    res.status(500).json({ error: 'Error creating new user.' });
  }
}

/*
 * Route for user login.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!JWT_SECRET) {
      console.error("FATAL: JWT_SECRET is not defined in environment variables.");
      return res.status(500).json({ error: "Server configuration error: JWT secret missing." });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const payload = {
      userId: user._id,
      name: user.name,
      email: user.email,
      admin: user.admin
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ token: token });

  } catch (err) {
    console.error("== Error during login:", err);
    res.status(500).json({ error: 'Error during login.' });
  }
});

/*
 * Route to get user details by userId (excluding password).
 * - Admins can see any user's data.
 */
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const authenticatedUser = req.user;

    if (authenticatedUser.userId !== requestedUserId && !authenticatedUser.admin) {
      return res.status(403).json({ error: 'Forbidden - You can only view your own user data.' });
    }

    const user = await User.findById(requestedUserId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json(user);

  } catch (err) {
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ error: `Invalid user ID format: ${req.params.userId}` });
    }
    console.error("== Error fetching user by ID:", err);
    res.status(500).json({ error: 'Error fetching user information.' });
  }
});

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userid/businesses', requireAuth, async function (req, res) {
  const requestedUserId = req.params.userid;
  const authenticatedUser = req.user;

  if (authenticatedUser.userId !== requestedUserId && !authenticatedUser.admin) {
    return res.status(403).json({ error: 'Forbidden - You can only view your own businesses.' });
  }

  try {
    const userBusinesses = await Business.find({ ownerid: requestedUserId });
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
router.get('/:userid/reviews', requireAuth, async function (req, res) {
  const requestedUserId = req.params.userid;
  const authenticatedUser = req.user;

  if (authenticatedUser.userId !== requestedUserId && !authenticatedUser.admin) {
    return res.status(403).json({ error: 'Forbidden - You can only view your own reviews.' });
  }

  try {
    const userReviews = await Review.find({ userid: requestedUserId });
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
router.get('/:userid/photos', requireAuth, async function (req, res) {
  const requestedUserId = req.params.userid;
  const authenticatedUser = req.user;

  if (authenticatedUser.userId !== requestedUserId && !authenticatedUser.admin) {
    return res.status(403).json({ error: 'Forbidden - You can only view your own photos.' });
  }

  try {
    const userPhotos = await Photo.find({ userid: requestedUserId });
    res.status(200).json({
      photos: userPhotos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user's photos." });
  }
});

exports.router = router;