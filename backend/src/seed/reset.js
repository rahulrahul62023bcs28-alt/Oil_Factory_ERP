import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oilfactory';

async function resetDatabase() {
  console.log(`🧹 Connecting to MongoDB: ${uri}`);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('🗑️ Removing production batches...');
  const prodRes = await db.collection('productions').deleteMany({});
  console.log(`   Removed ${prodRes.deletedCount} production batches.`);

  console.log('🗑️ Removing sales orders...');
  const salesRes = await db.collection('sales').deleteMany({});
  console.log(`   Removed ${salesRes.deletedCount} sales records.`);

  console.log('🗑️ Removing supplier intake logs...');
  const supRes = await db.collection('suppliers').deleteMany({});
  console.log(`   Removed ${supRes.deletedCount} supplier records.`);

  // Drop deprecated employees collection completely
  console.log('🗑️ Dropping deprecated employees collection (unifying into users)...');
  await db.collection('employees').drop().catch(() => {});

  console.log('🗑️ Removing non-admin user accounts...');
  const userRes = await db.collection('users').deleteMany({
    username: { $ne: 'Raghul' },
    email: { $ne: 'raghuluma2006@gmail.com' },
  });
  console.log(`   Removed ${userRes.deletedCount} user accounts.`);

  console.log('🛢️ Resetting inventory tanks to 0 Liters...');
  await db.collection('inventories').updateMany({}, { $set: { currentLiters: 0 } });

  const invCount = await db.collection('inventories').countDocuments();
  if (invCount === 0) {
    await db.collection('inventories').insertMany([
      { id: 1, name: 'Groundnut Oil', currentLiters: 0, capacityLiters: 10000, minAlert: 1000 },
      { id: 2, name: 'Sunflower Oil', currentLiters: 0, capacityLiters: 8000, minAlert: 800 },
      { id: 3, name: 'Mustard Oil', currentLiters: 0, capacityLiters: 6000, minAlert: 500 },
      { id: 4, name: 'Sesame Oil', currentLiters: 0, capacityLiters: 5000, minAlert: 400 },
      { id: 5, name: 'Coconut Oil', currentLiters: 0, capacityLiters: 7000, minAlert: 1000 },
    ]);
  }

  // Ensure Admin user exists with all unified fields
  const adminUser = await db.collection('users').findOne({
    $or: [{ email: 'raghuluma2006@gmail.com' }, { username: 'Raghul' }],
  });
  if (!adminUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Raghul@2006', salt);
    await db.collection('users').insertOne({
      id: 'EMP-01',
      email: 'raghuluma2006@gmail.com',
      username: 'Raghul',
      password: hashedPassword,
      name: 'Raghul (Administrator)',
      role: 'Administrator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      department: 'System Architecture & Operations',
      dept: 'System Architecture & Operations',
      shift: 'General Shift (08:00 - 17:00)',
      allocatedMachine: 'Central Command Terminal',
      attendance: 'Present',
      status: 'Active',
    });
  } else {
    await db.collection('users').updateOne(
      { _id: adminUser._id },
      {
        $set: {
          id: 'EMP-01',
          dept: adminUser.dept || adminUser.department || 'System Architecture & Operations',
          shift: adminUser.shift || 'General Shift (08:00 - 17:00)',
          allocatedMachine: adminUser.allocatedMachine || 'Central Command Terminal',
          attendance: adminUser.attendance || 'Present',
        },
      }
    );
  }

  console.log('\n✨ Database successfully reset to clean starting state!');
  console.log('----------------------------------------------------');
  console.log('📊 Current Database Status:');
  const counts = {
    productions: await db.collection('productions').countDocuments(),
    sales: await db.collection('sales').countDocuments(),
    suppliers: await db.collection('suppliers').countDocuments(),
    users: await db.collection('users').countDocuments(),
    inventories: await db.collection('inventories').countDocuments(),
  };
  console.table(counts);

  await mongoose.disconnect();
}

resetDatabase().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
