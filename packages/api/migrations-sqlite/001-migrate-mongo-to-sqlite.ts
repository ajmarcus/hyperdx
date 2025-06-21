import { MongoClient, Db as MongoDb, ObjectId } from 'mongodb';
import * as path from 'path';
import * as config from '../src/config'; // Assuming config can be loaded

// Import all Sequelize models and the instance from the application's model index
import {
  sequelizeInstance as sequelize, // Renamed for clarity in this script
  User,
  Team,
  TeamInvite,
  Source,
  SavedSearch,
  Dashboard,
  Connection,
  Alert,
  AlertHistory,
  Webhook,
} from '../src/models'; // This now imports the initialized Sequelize instance and models

// List of models to migrate - Mongoose collection name to Sequelize model
// Note: Collection names are Mongoose default (lowercase, pluralized)
const modelsToMigrate = [
  { mongoCollection: 'users', sequelizeModel: User },
  { mongoCollection: 'teams', sequelizeModel: Team },
  { mongoCollection: 'teaminvites', sequelizeModel: TeamInvite },
  { mongoCollection: 'sources', sequelizeModel: Source },
  { mongoCollection: 'savedsearches', sequelizeModel: SavedSearch },
  { mongoCollection: 'dashboards', sequelizeModel: Dashboard },
  { mongoCollection: 'connections', sequelizeModel: Connection },
  { mongoCollection: 'alerts', sequelizeModel: Alert },
  { mongoCollection: 'alerthistories', sequelizeModel: AlertHistory },
  { mongoCollection: 'webhooks', sequelizeModel: Webhook },
];

// Helper to transform MongoDB document to Sequelize-compatible object
function transformDocument(doc: any, model: any): any {
  const newDoc: any = {};

  // Map _id to id
  if (doc._id) {
    newDoc.id = doc._id.toString();
  }

  const attributes = model.getAttributes();
  for (const key in attributes) {
    if (doc.hasOwnProperty(key) && key !== 'id') { // 'id' is already handled from '_id'
      if (doc[key] instanceof ObjectId) {
        newDoc[key] = doc[key].toString();
      } else {
        newDoc[key] = doc[key];
      }
    }
  }

  // Specific Foreign Key Mappings (Common Patterns)
  // These are guesses; actual field names in Mongo documents might vary.
  if (doc.team && doc.team instanceof ObjectId) {
    newDoc.teamId = doc.team.toString();
  }
  if (doc.source && doc.source instanceof ObjectId && model.name === 'SavedSearch') { // Be specific
    newDoc.sourceId = doc.source.toString();
  }
  if (doc.connection && doc.connection instanceof ObjectId && model.name === 'Source') {
    newDoc.connectionId = doc.connection.toString();
  }
  if (doc.alert && doc.alert instanceof ObjectId && model.name === 'AlertHistory') {
    newDoc.alertId = doc.alert.toString();
  }
  if (doc.savedSearch && doc.savedSearch instanceof ObjectId && model.name === 'Alert') {
    newDoc.savedSearchId = doc.savedSearch.toString();
  }
  if (doc.dashboard && doc.dashboard instanceof ObjectId && model.name === 'Alert') {
    newDoc.dashboardId = doc.dashboard.toString();
  }
  // If 'silenced.by' was a direct ObjectId field in Mongo for Alert model
  if (doc.silenced && doc.silenced.by instanceof ObjectId && model.name === 'Alert') {
    // Create a deep copy of silenced to avoid modifying the original doc's silenced property
    newDoc.silenced = { ...doc.silenced, by: doc.silenced.by.toString() };
  }


  // Add more sophisticated, model-specific transformations here if needed
  // e.g., renaming fields, restructuring embedded documents to JSONB, etc.
  // Example for Alert's 'channel' which is JSONB
  if (model.name === 'Alert' && doc.channel) {
    newDoc.channel = doc.channel; // Assuming structure is compatible or handled by Sequelize JSONB
  }
  // Example for Alert's 'silenced' which is JSONB
  if (model.name === 'Alert' && doc.silenced) {
    // Ensure 'by' field within silenced is converted if it's an ObjectId
    const silencedCopy = { ...doc.silenced };
    if (silencedCopy.by instanceof ObjectId) {
      silencedCopy.by = silencedCopy.by.toString();
    }
    newDoc.silenced = silencedCopy;
  }


  // Remove fields from Mongo doc that don't exist in Sequelize model to avoid errors
  const modelAttributes = Object.keys(attributes);
  for (const key in newDoc) {
    if (!modelAttributes.includes(key) && key !== 'id') { // allow 'id' as it's the PK
      // A bit aggressive, could log instead. Or rely on Sequelize's `attributes` option in `bulkCreate`.
      // delete newDoc[key];
    }
  }
  // Delete the original mongoose version fields like __v
  delete newDoc.__v;


  return newDoc;
}


async function migrate() {
  let mongoClient: MongoClient | null = null;

  try {
    // Connect to MongoDB
    if (!config.MONGO_URI) {
      console.error('MONGO_URI is not defined in config. Exiting.');
      process.exit(1);
    }
    mongoClient = new MongoClient(config.MONGO_URI);
    await mongoClient.connect();
    const mongoDb: MongoDb = mongoClient.db(); // Use default DB from URI
    console.log('Connected to MongoDB');

    // Sequelize is already connected and configured via ../src/models/index
    // We just need to ensure tables are there (connectDB in index.ts should do this)
    // However, for a migration script, explicitly calling sync might be safer.
    await sequelize.sync({ alter: true }); // Use alter:true to be safe if schema changed slightly
    console.log('SQLite tables synchronized');

    for (const { mongoCollection, sequelizeModel } of modelsToMigrate) {
      console.log(`Migrating collection: ${mongoCollection} to table: ${sequelizeModel.tableName}`);
      const collection = mongoDb.collection(mongoCollection);
      const documents = await collection.find({}).toArray();

      if (documents.length === 0) {
        console.log(`No documents found in ${mongoCollection}. Skipping.`);
        continue;
      }

      const transformedDocuments = documents.map(doc => transformDocument(doc, sequelizeModel));

      // @ts-ignore sequelize model is a valid type here
      // @ts-ignore sequelize model is a valid type here
      await sequelizeModel.bulkCreate(transformedDocuments, {
        validate: true,
        ignoreDuplicates: true, // This skips rows with PK conflicts if the PK (id from MongoDB _id) already exists.
      });
      console.log(`Successfully migrated ${documents.length} documents from ${mongoCollection} to ${sequelizeModel.tableName}`);
    }

    console.log('Data migration completed successfully!');

  } catch (error) {
    console.error('Error during migration:', error);
    // Log the model being processed if possible
    // if (error.model) console.error("Error was for model:", error.model);
    process.exit(1);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    }
    // No need to close sequelize here if it's managed by the main app,
    // but if this script is standalone, then yes:
    // await sequelize.close();
    // console.log('SQLite connection closed');
  }
}

migrate();
