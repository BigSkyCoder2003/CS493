/*
 * This file contains a simple script to populate the database with initial
 * data from the files in the data/ directory.  The following environment
 * variables must be set to run this script:
 *
 *   MONGO_DB_NAME - The name of the database into which to insert data.
 *   MONGO_USER - The user to use to connect to the MongoDB server.
 *   MONGO_PASSWORD - The password for the specified user.
 *   MONGO_AUTH_DB_NAME - The database where the credentials are stored for
 *     the specified user.
 *
 * In addition, you may set the following environment variables to create a
 * new user with permissions on the database specified in MONGO_DB_NAME:
 *
 *   MONGO_CREATE_USER - The name of the user to create.
 *   MONGO_CREATE_PASSWORD - The password for the user.
 */

const { connectToDb, getDbReference, closeDbConnection } = require('./lib/mongo')
const { bulkInsertNewBusinesses } = require('./models/business')

const businessData = require('./data/businesses.json')

const mongoCreateUser = process.env.MONGO_CREATE_USER
const mongoCreatePassword = process.env.MONGO_CREATE_PASSWORD

connectToDb(async function () {
  /*
   * Insert initial business data into the database
   */
  const ids = await bulkInsertNewBusinesses(businessData)
  console.log("== Inserted businesses with IDs:", ids)

  /*
   * Create a new, lower-privileged database user if the correct environment
   * variables were specified.
   */
  if (mongoCreateUser && mongoCreatePassword) {
    const db = getDbReference()
    try {
      // Create user directly using createUser command
      await db.admin().command({
        createUser: mongoCreateUser,
        pwd: mongoCreatePassword,
        roles: [{ role: "readWrite", db: db.databaseName }]
      })
      console.log("== User created successfully:", mongoCreateUser)
    } catch (error) {
      // If user already exists, createUser will throw an error, which is fine
      if (error.code === 51003) { // User already exists error code
        console.log("== User already exists, skipping user creation")
      } else {
        console.error("== Error creating user:", error.message)
      }
    }
  }

  closeDbConnection(function () {
    console.log("== DB connection closed")
  })
})
