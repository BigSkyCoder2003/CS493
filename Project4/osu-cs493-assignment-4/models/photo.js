/*
 * Photo schema and data accessor methods.
 */

const { GridFSBucket, ObjectId } = require('mongodb')
const { getDbReference } = require('../lib/mongo')

/*
 * Schema describing required/optional fields of a photo object.
 */
const PhotoSchema = {
  businessId: { required: true },
  caption: { required: false },
  contentType: { required: true },
  filename: { required: true }
}

/*
 * Gets the GridFS bucket for photos
 */
function getPhotoBucket() {
  const db = getDbReference()
  return new GridFSBucket(db, { bucketName: 'photos' })
}

/*
 * Executes a DB query to insert a new photo into GridFS.  Returns
 * a Promise that resolves to the newly created photo object.
 */
async function insertNewPhoto(photo, file) {
  if (!ObjectId.isValid(photo.businessId)) {
    throw new Error("Invalid business ID")
  }

  const db = getDbReference()
  const bucket = getPhotoBucket()
  
  return new Promise((resolve, reject) => {
    const metadata = {
      businessId: ObjectId(photo.businessId),
      caption: photo.caption
    }

    const uploadStream = bucket.openUploadStream(
      file.originalname,
      {
        contentType: file.mimetype,
        metadata: metadata
      }
    )

    uploadStream.on('error', reject)
    uploadStream.on('finish', (result) => {
      resolve({
        _id: result._id,
        filename: result.filename,
        contentType: file.mimetype,
        businessId: metadata.businessId,
        caption: metadata.caption
      })
    })

    uploadStream.end(file.buffer)
  })
}

/*
 * Executes a DB query to fetch a single specified photo based on its ID.
 * Returns a Promise that resolves to an object containing the requested
 * photo.  If no photo with the specified ID exists, the returned Promise
 * will resolve to null.
 */
async function getPhotoById(id) {
  if (!ObjectId.isValid(id)) {
    return null
  }
  const db = getDbReference()
  const bucket = getPhotoBucket()
  try {
    const metadata = await bucket.find({ _id: new ObjectId(id) }).next()
    if (!metadata) {
      return null
    }
    return {
      _id: metadata._id,
      filename: metadata.filename,
      contentType: metadata.contentType,
      businessId: metadata.metadata.businessId,
      caption: metadata.metadata.caption
    }
  } catch (err) {
    console.error(err)
    return null
  }
}

/*
 * Creates a read stream for a photo in GridFS.
 */
async function getPhotoDownloadStream(id) {
  if (!ObjectId.isValid(id)) {
    return null
  }
  const bucket = getPhotoBucket()
  try {
    const downloadStream = bucket.openDownloadStream(new ObjectId(id))
    
    // Check if the file exists
    downloadStream.on('error', (error) => {
      console.error('GridFS download stream error:', error)
    })
    
    return downloadStream
  } catch (err) {
    console.error('Error creating download stream:', err)
    return null
  }
}

/*
 * Gets photos for a specific business
 */
async function getPhotosByBusinessId(businessId) {
  if (!ObjectId.isValid(businessId)) {
    return []
  }
  const bucket = getPhotoBucket()
  const photos = await bucket
    .find({ 'metadata.businessId': new ObjectId(businessId) })
    .toArray()
  
  return photos.map(photo => ({
    _id: photo._id,
    filename: photo.filename,
    contentType: photo.contentType,
    businessId: photo.metadata.businessId,
    caption: photo.metadata.caption
  }))
}

/*
 * Validates that the content type of an uploaded photo is acceptable.
 */
function validatePhotoType(contentType) {
  return contentType === 'image/jpeg' || contentType === 'image/png'
}

exports.PhotoSchema = PhotoSchema
exports.insertNewPhoto = insertNewPhoto
exports.getPhotoById = getPhotoById
exports.getPhotoDownloadStream = getPhotoDownloadStream
exports.getPhotosByBusinessId = getPhotosByBusinessId
exports.validatePhotoType = validatePhotoType
