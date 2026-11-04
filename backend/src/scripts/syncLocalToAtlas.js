import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const LOCAL_URI = process.env.LOCAL_MONGODB_URI || 'mongodb://127.0.0.1:27017/oilfactory';
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('❌ MONGODB_URI is not defined in your environment or backend/.env file.');
  process.exit(1);
}

async function migrateData() {
  console.log('🚀 Starting Local Compass -> MongoDB Atlas Migration...');

  let localClient;
  let atlasClient;

  try {
    console.log('📡 Connecting to Localhost MongoDB...');
    localClient = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to Local MongoDB.');

    console.log('📡 Connecting to MongoDB Atlas...');
    atlasClient = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas.');

    const localDb = localClient.db;
    const atlasDb = atlasClient.db;

    const collections = await localDb.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections in local database:`, collections.map(c => c.name));

    for (const colInfo of collections) {
      const colName = colInfo.name;
      const localCol = localDb.collection(colName);
      const atlasCol = atlasDb.collection(colName);

      const docs = await localCol.find({}).toArray();
      console.log(`\n⏳ Migrating collection '${colName}' (${docs.length} documents)...`);

      // Clear existing docs in Atlas for this collection to ensure an exact replica
      await atlasCol.deleteMany({});

      if (docs.length > 0) {
        await atlasCol.insertMany(docs);
        console.log(`✅ Successfully cloned ${docs.length} documents into Atlas '${colName}'.`);
      } else {
        console.log(`ℹ️ Collection '${colName}' is empty, skipping insert.`);
      }
    }

    console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY CLONED TO MONGODB ATLAS!');
    
    // Verification
    console.log('\n🔍 Verifying Atlas collections & counts:');
    const atlasCols = await atlasDb.listCollections().toArray();
    for (const c of atlasCols) {
      const count = await atlasDb.collection(c.name).countDocuments();
      console.log(`  - ${c.name}: ${count} documents`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (localClient) await localClient.close();
    if (atlasClient) await atlasClient.close();
    console.log('\n🔒 Connections closed.');
    process.exit(0);
  }
}

migrateData();
