/*
 * Business schema and data accessor methods.
 */

const { ObjectId } = require('mongodb')
const { getDbReference } = require('../lib/mongo')
const { extractValidFields } = require('../lib/validation')
const { getPhotosByBusinessId } = require('./photo')

/*
 * Schema describing required/optional fields of a business object.
 */
const BusinessSchema = {
  name: { required: true },
  address: { required: true },
  city: { required: true },
  state: { required: true },
  zip: { required: true },
  category: { required: true },
  subcategory: { required: true },
  website: { required: false },
  email: { required: false }
}

function getPhotoPath(photo) {
  const extension = photo.contentType === 'image/png' ? 'png' : 'jpg'
  return `/media/photos/${photo._id}.${extension}`
}

/*
 * Executes a DB query to return a single page of businesses.  Returns a
 * Promise that resolves to an array containing the fetched page of businesses.
 */
async function getBusinessesPage(page) {
  const db = getDbReference()
  const collection = db.collection('businesses')
  const count = await collection.countDocuments()

  const pageSize = 10
  const lastPage = Math.ceil(count / pageSize)
  page = page > lastPage ? lastPage : page
  page = page < 1 ? 1 : page
  const offset = (page - 1) * pageSize

  const results = await collection.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray()

  return {
    businesses: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  }
}

/*
 * Executes a DB query to insert a new business into the database.  Returns
 * a Promise that resolves to the ID of the newly-created business entry.
 */
async function insertNewBusiness(business) {
  business = extractValidFields(business, BusinessSchema)
  const db = getDbReference()
  const collection = db.collection('businesses')
  const result = await collection.insertOne(business)
  return result.insertedId
}

/*
 * Executes a DB query to fetch detailed information about a single
 * specified business based on its ID, including photos.  Returns a Promise that
 * resolves to an object containing information about the requested business.
 * If no business with the specified ID exists, the returned Promise will
 * resolve to null.
 */
async function getBusinessById(id) {
  const db = getDbReference()
  const collection = db.collection('businesses')
  if (!ObjectId.isValid(id)) {
    return null
  }

  const business = await collection.findOne({ _id: new ObjectId(id) })
  if (!business) {
    return null
  }

  // Get photos for this business and add paths
  const photos = await getPhotosByBusinessId(id)
  business.photos = photos.map(photo => {
    const extension = photo.contentType === 'image/png' ? '.png' : '.jpg'
    return {
      ...photo,
      path: `/media/photos/${photo._id}${extension}`
    }
  })

  return business
}

/*
 * Executes a DB query to bulk insert new businesses into the database.
 * Returns a Promise that resolves to a map of the IDs of the newly-created
 * business entries.
 */
async function bulkInsertNewBusinesses(businesses) {
  const businessesToInsert = businesses.map(function (business) {
    return extractValidFields(business, BusinessSchema)
  })
  const db = getDbReference()
  const collection = db.collection('businesses')
  const result = await collection.insertMany(businessesToInsert)
  return result.insertedIds
}

exports.BusinessSchema = BusinessSchema
exports.getBusinessesPage = getBusinessesPage
exports.insertNewBusiness = insertNewBusiness
exports.getBusinessById = getBusinessById
exports.bulkInsertNewBusinesses = bulkInsertNewBusinesses
