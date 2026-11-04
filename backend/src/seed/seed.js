import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import Production from '../models/Production.js';
import Sales from '../models/Sales.js';
import Supplier from '../models/Supplier.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('🌱 [Database Seed] Initializing rich industrial datasets...');

    // 1. Seed Inventory only if collection is empty
    const shouldSeedDemo = process.env.SEED_DEMO_DATA === 'true';
    const invCount = await Inventory.countDocuments();
    if (invCount === 0) {
      const initialInventory = [
        { id: 1, name: 'Groundnut Oil', currentLiters: shouldSeedDemo ? 3200 : 0, capacityLiters: 10000, minAlert: 1000 },
        { id: 2, name: 'Sunflower Oil', currentLiters: shouldSeedDemo ? 2400 : 0, capacityLiters: 8000, minAlert: 800 },
        { id: 3, name: 'Mustard Oil', currentLiters: shouldSeedDemo ? 1100 : 0, capacityLiters: 6000, minAlert: 500 },
        { id: 4, name: 'Sesame Oil', currentLiters: shouldSeedDemo ? 1650 : 0, capacityLiters: 5000, minAlert: 400 },
        { id: 5, name: 'Coconut Oil', currentLiters: shouldSeedDemo ? 2900 : 0, capacityLiters: 7000, minAlert: 1000 },
      ];

      for (const tank of initialInventory) {
        await Inventory.findOneAndUpdate(
          { id: tank.id },
          { $set: { name: tank.name, capacityLiters: tank.capacityLiters, minAlert: tank.minAlert, currentLiters: tank.currentLiters } },
          { upsert: true }
        );
      }
      console.log('✅ [Database Seed] Initial Inventory tanks initialized.');
    }

    // 2. Seed Administrator User if not present
    const adminEmail = 'raghuluma2006@gmail.com';
    const adminExists = await User.findOne({
      $or: [{ email: adminEmail }, { username: 'Raghul' }],
    });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Raghul@2006', salt);

      await User.create({
        id: 'EMP-01',
        email: adminEmail,
        username: 'Raghul',
        password: hashedPassword,
        name: 'Raghul (Administrator)',
        role: 'Administrator',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        department: 'System Architecture & Operations',
        dept: 'System Architecture & Operations',
        shift: 'General Shift (08:00 - 17:00)',
        allocatedMachine: 'Central Command Terminal',
        status: 'Active',
      });
      console.log('✅ [Database Seed] Default Administrator account verified.');
    }

    // Seed Demo Factory Manager & Staff only if demo seed is requested
    if (shouldSeedDemo) {
      const userCount = await User.countDocuments();
      if (userCount <= 1) {
      // Seed Demo Factory Manager if not present
      const managerEmail = 'manager@smartoil.com';
      const managerExists = await User.findOne({ email: managerEmail });
      if (!managerExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Manager@123', salt);
        await User.create({
          id: 'EMP-02',
          email: managerEmail,
          username: 'manager',
          password: hashedPassword,
          name: 'Suresh Kumar (Plant Manager)',
          role: 'Factory Manager',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
          department: 'Plant Operations & Extraction',
          dept: 'Plant Operations & Extraction',
          shift: 'Morning Shift (06:00 - 14:00)',
          allocatedMachine: 'Extraction Line Control Station',
          status: 'Active',
        });
        console.log('✅ [Database Seed] Factory Manager account verified.');
      }

      // Seed Demo Factory Staff / Operator if not present
      const staffEmail = 'operator@smartoil.com';
      const staffExists = await User.findOne({ email: staffEmail });
      if (!staffExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Operator@123', salt);
        await User.create({
          id: 'EMP-03',
          email: staffEmail,
          username: 'operator',
          password: hashedPassword,
          name: 'Karthik Raja (Expeller Tech)',
          role: 'Factory Staff',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
          department: 'Cold Press Line #1',
          dept: 'Cold Press Line #1',
          shift: 'General Shift (08:00 - 17:00)',
          allocatedMachine: 'Mara Chekku Press Unit #3',
          status: 'Active',
        });
        console.log('✅ [Database Seed] Factory Staff account verified.');
      }
    }
  }

    // 4. Seed Comprehensive Historical Production Batches (68 Batches across all 5 Oils)
    // Conforms strictly to ICAR (Indian Council of Agricultural Research) & TNAU standards
    const productionBatches = [
      // ─────────────────────────────────────────────────────────────────────────────
      // GROUNDNUT OIL BATCHES (15 Batches: Baseline 41.0% Recovery, ICAR Standard)
      // ─────────────────────────────────────────────────────────────────────────────
      { id: 'PRD-GND-01', oilType: 'Groundnut Oil', rawSeedWeightKg: 450, quantityLiters: 184, details: 'Mara Chekku cold press - Pilot batch', date: '2026-08-16' },
      { id: 'PRD-GND-02', oilType: 'Groundnut Oil', rawSeedWeightKg: 800, quantityLiters: 328, details: 'Expeller unit #1 - Saurashtra Grade A seeds', date: '2026-08-21' },
      { id: 'PRD-GND-03', oilType: 'Groundnut Oil', rawSeedWeightKg: 1200, quantityLiters: 494, details: 'Hydraulic press - Low moisture kernels (6.5%)', date: '2026-08-27' },
      { id: 'PRD-GND-04', oilType: 'Groundnut Oil', rawSeedWeightKg: 1500, quantityLiters: 615, details: 'Standard expeller pressing batch #104', date: '2026-09-02' },
      { id: 'PRD-GND-05', oilType: 'Groundnut Oil', rawSeedWeightKg: 1800, quantityLiters: 742, details: 'Cold-pressed batch #105 - Fine mesh filtration', date: '2026-09-07' },
      { id: 'PRD-GND-06', oilType: 'Groundnut Oil', rawSeedWeightKg: 2200, quantityLiters: 906, details: 'Expeller unit #2 - Karnataka shelled kernels', date: '2026-09-12' },
      { id: 'PRD-GND-07', oilType: 'Groundnut Oil', rawSeedWeightKg: 2500, quantityLiters: 1030, details: 'Hydraulic press batch #107 - Peak efficiency', date: '2026-09-17' },
      { id: 'PRD-GND-08', oilType: 'Groundnut Oil', rawSeedWeightKg: 2800, quantityLiters: 1154, details: 'Commercial expeller morning run #108', date: '2026-09-22' },
      { id: 'PRD-GND-09', oilType: 'Groundnut Oil', rawSeedWeightKg: 3200, quantityLiters: 1318, details: 'Cold-pressed batch #109 - 42°C thermal lock', date: '2026-09-27' },
      { id: 'PRD-GND-10', oilType: 'Groundnut Oil', rawSeedWeightKg: 3600, quantityLiters: 1482, details: 'Dual expeller synchronized run #110', date: '2026-10-02' },
      { id: 'PRD-GND-11', oilType: 'Groundnut Oil', rawSeedWeightKg: 4000, quantityLiters: 1648, details: 'Silo extraction run #111 - Grade A kernels', date: '2026-10-07' },
      { id: 'PRD-GND-12', oilType: 'Groundnut Oil', rawSeedWeightKg: 4500, quantityLiters: 1852, details: 'High-volume commercial expeller batch #112', date: '2026-10-12' },
      { id: 'PRD-GND-13', oilType: 'Groundnut Oil', rawSeedWeightKg: 5000, quantityLiters: 2060, details: 'Bulk factory processing run #113', date: '2026-10-16' },
      { id: 'PRD-GND-14', oilType: 'Groundnut Oil', rawSeedWeightKg: 5500, quantityLiters: 2265, details: 'Dual expeller continuous shift batch #114', date: '2026-10-19' },
      { id: 'PRD-GND-15', oilType: 'Groundnut Oil', rawSeedWeightKg: 6000, quantityLiters: 2475, details: 'Wholesale order commercial production #115', date: '2026-10-22' },

      // ─────────────────────────────────────────────────────────────────────────────
      // SUNFLOWER OIL BATCHES (13 Batches: Baseline 35.5% Recovery, Whole Seed Press)
      // ─────────────────────────────────────────────────────────────────────────────
      { id: 'PRD-SNF-01', oilType: 'Sunflower Oil', rawSeedWeightKg: 500, quantityLiters: 176, details: 'Whole seed expeller pilot #201', date: '2026-08-17' },
      { id: 'PRD-SNF-02', oilType: 'Sunflower Oil', rawSeedWeightKg: 850, quantityLiters: 301, details: 'Cold-pressed sunflower batch #202', date: '2026-08-23' },
      { id: 'PRD-SNF-03', oilType: 'Sunflower Oil', rawSeedWeightKg: 1200, quantityLiters: 426, details: 'De-hulled sunflower seeds #203', date: '2026-08-29' },
      { id: 'PRD-SNF-04', oilType: 'Sunflower Oil', rawSeedWeightKg: 1600, quantityLiters: 570, details: 'Expeller press line 1 #204', date: '2026-09-04' },
      { id: 'PRD-SNF-05', oilType: 'Sunflower Oil', rawSeedWeightKg: 2000, quantityLiters: 712, details: 'Hydraulic batch #205', date: '2026-09-09' },
      { id: 'PRD-SNF-06', oilType: 'Sunflower Oil', rawSeedWeightKg: 2400, quantityLiters: 855, details: 'Pressing unit #2 batch #206', date: '2026-09-14' },
      { id: 'PRD-SNF-07', oilType: 'Sunflower Oil', rawSeedWeightKg: 2800, quantityLiters: 997, details: 'Standard sunflower batch #207', date: '2026-09-20' },
      { id: 'PRD-SNF-08', oilType: 'Sunflower Oil', rawSeedWeightKg: 3200, quantityLiters: 1140, details: 'Commercial screw press #208', date: '2026-09-25' },
      { id: 'PRD-SNF-09', oilType: 'Sunflower Oil', rawSeedWeightKg: 3600, quantityLiters: 1282, details: 'Bulk seed extraction run #209', date: '2026-09-30' },
      { id: 'PRD-SNF-10', oilType: 'Sunflower Oil', rawSeedWeightKg: 4000, quantityLiters: 1424, details: 'Silo extraction batch #210', date: '2026-10-06' },
      { id: 'PRD-SNF-11', oilType: 'Sunflower Oil', rawSeedWeightKg: 4500, quantityLiters: 1602, details: 'High-yield mechanical press #211', date: '2026-10-11' },
      { id: 'PRD-SNF-12', oilType: 'Sunflower Oil', rawSeedWeightKg: 5000, quantityLiters: 1780, details: 'Wholesale sunflower batch #212', date: '2026-10-17' },
      { id: 'PRD-SNF-13', oilType: 'Sunflower Oil', rawSeedWeightKg: 5500, quantityLiters: 1958, details: 'Continuous pressing run #213', date: '2026-10-21' },

      // ─────────────────────────────────────────────────────────────────────────────
      // MUSTARD OIL BATCHES (13 Batches: Baseline 33.5% Recovery, Kachi Ghani Cold Press)
      // ─────────────────────────────────────────────────────────────────────────────
      { id: 'PRD-MST-01', oilType: 'Mustard Oil', rawSeedWeightKg: 450, quantityLiters: 150, details: 'Kachi Ghani wooden kolhu #301', date: '2026-08-18' },
      { id: 'PRD-MST-02', oilType: 'Mustard Oil', rawSeedWeightKg: 800, quantityLiters: 268, details: 'Slow cold extraction #302', date: '2026-08-24' },
      { id: 'PRD-MST-03', oilType: 'Mustard Oil', rawSeedWeightKg: 1100, quantityLiters: 369, details: 'Traditional yellow mustard #303', date: '2026-08-30' },
      { id: 'PRD-MST-04', oilType: 'Mustard Oil', rawSeedWeightKg: 1500, quantityLiters: 503, details: 'Expeller press batch #304', date: '2026-09-05' },
      { id: 'PRD-MST-05', oilType: 'Mustard Oil', rawSeedWeightKg: 1900, quantityLiters: 638, details: 'High-pungency Kachi Ghani #305', date: '2026-09-10' },
      { id: 'PRD-MST-06', oilType: 'Mustard Oil', rawSeedWeightKg: 2300, quantityLiters: 772, details: 'Cold-pressed mustard batch #306', date: '2026-09-16' },
      { id: 'PRD-MST-07', oilType: 'Mustard Oil', rawSeedWeightKg: 2700, quantityLiters: 906, details: 'Expeller unit #1 batch #307', date: '2026-09-21' },
      { id: 'PRD-MST-08', oilType: 'Mustard Oil', rawSeedWeightKg: 3100, quantityLiters: 1040, details: 'Standard extraction batch #308', date: '2026-09-26' },
      { id: 'PRD-MST-09', oilType: 'Mustard Oil', rawSeedWeightKg: 3500, quantityLiters: 1175, details: 'Multi-screw expeller batch #309', date: '2026-10-03' },
      { id: 'PRD-MST-10', oilType: 'Mustard Oil', rawSeedWeightKg: 4000, quantityLiters: 1342, details: 'Commercial mustard press #310', date: '2026-10-08' },
      { id: 'PRD-MST-11', oilType: 'Mustard Oil', rawSeedWeightKg: 4400, quantityLiters: 1476, details: 'Kachi Ghani bulk run #311', date: '2026-10-13' },
      { id: 'PRD-MST-12', oilType: 'Mustard Oil', rawSeedWeightKg: 4800, quantityLiters: 1611, details: 'Standard refining batch #312', date: '2026-10-18' },
      { id: 'PRD-MST-13', oilType: 'Mustard Oil', rawSeedWeightKg: 5200, quantityLiters: 1746, details: 'Continuous expeller batch #313', date: '2026-10-22' },

      // ─────────────────────────────────────────────────────────────────────────────
      // SESAME OIL BATCHES (13 Batches: Baseline 42.0% Recovery, Mara Chekku)
      // ─────────────────────────────────────────────────────────────────────────────
      { id: 'PRD-SES-01', oilType: 'Sesame Oil', rawSeedWeightKg: 400, quantityLiters: 168, details: 'Chekku sesame batch with palm jaggery #401', date: '2026-08-19' },
      { id: 'PRD-SES-02', oilType: 'Sesame Oil', rawSeedWeightKg: 750, quantityLiters: 315, details: 'Mara Chekku slow pressed #402', date: '2026-08-25' },
      { id: 'PRD-SES-03', oilType: 'Sesame Oil', rawSeedWeightKg: 1100, quantityLiters: 463, details: 'Cold-pressed black sesame #403', date: '2026-08-31' },
      { id: 'PRD-SES-04', oilType: 'Sesame Oil', rawSeedWeightKg: 1500, quantityLiters: 632, details: 'Traditional wood press batch #404', date: '2026-09-06' },
      { id: 'PRD-SES-05', oilType: 'Sesame Oil', rawSeedWeightKg: 1900, quantityLiters: 800, details: 'Expeller press batch #405', date: '2026-09-11' },
      { id: 'PRD-SES-06', oilType: 'Sesame Oil', rawSeedWeightKg: 2300, quantityLiters: 969, details: 'Mara Chekku batch #406', date: '2026-09-17' },
      { id: 'PRD-SES-07', oilType: 'Sesame Oil', rawSeedWeightKg: 2700, quantityLiters: 1137, details: 'Cold-pressed white sesame #407', date: '2026-09-22' },
      { id: 'PRD-SES-08', oilType: 'Sesame Oil', rawSeedWeightKg: 3100, quantityLiters: 1306, details: 'Standard extraction batch #408', date: '2026-09-28' },
      { id: 'PRD-SES-09', oilType: 'Sesame Oil', rawSeedWeightKg: 3500, quantityLiters: 1475, details: 'Commercial expeller batch #409', date: '2026-10-04' },
      { id: 'PRD-SES-10', oilType: 'Sesame Oil', rawSeedWeightKg: 3900, quantityLiters: 1642, details: 'Dual expeller press #410', date: '2026-10-09' },
      { id: 'PRD-SES-11', oilType: 'Sesame Oil', rawSeedWeightKg: 4300, quantityLiters: 1812, details: 'High-purity sesame oil #411', date: '2026-10-14' },
      { id: 'PRD-SES-12', oilType: 'Sesame Oil', rawSeedWeightKg: 4700, quantityLiters: 1980, details: 'Wholesale batch #412', date: '2026-10-19' },
      { id: 'PRD-SES-13', oilType: 'Sesame Oil', rawSeedWeightKg: 5100, quantityLiters: 2150, details: 'Commercial expeller shift #413', date: '2026-10-23' },

      // ─────────────────────────────────────────────────────────────────────────────
      // COCONUT OIL BATCHES (14 Batches: Baseline 57.5% Recovery, Sun-Dried Copra)
      // ─────────────────────────────────────────────────────────────────────────────
      { id: 'PRD-COC-01', oilType: 'Coconut Oil', rawSeedWeightKg: 450, quantityLiters: 258, details: 'Virgin coconut extraction #501', date: '2026-08-16' },
      { id: 'PRD-COC-02', oilType: 'Coconut Oil', rawSeedWeightKg: 800, quantityLiters: 460, details: 'Cold-pressed copra batch #502', date: '2026-08-22' },
      { id: 'PRD-COC-03', oilType: 'Coconut Oil', rawSeedWeightKg: 1200, quantityLiters: 691, details: 'Sun-dried copra mechanical press #503', date: '2026-08-28' },
      { id: 'PRD-COC-04', oilType: 'Coconut Oil', rawSeedWeightKg: 1600, quantityLiters: 922, details: 'Hydraulic copra press #504', date: '2026-09-03' },
      { id: 'PRD-COC-05', oilType: 'Coconut Oil', rawSeedWeightKg: 2000, quantityLiters: 1152, details: 'Virgin coconut batch #505', date: '2026-09-08' },
      { id: 'PRD-COC-06', oilType: 'Coconut Oil', rawSeedWeightKg: 2400, quantityLiters: 1383, details: 'Expeller unit #2 batch #506', date: '2026-09-13' },
      { id: 'PRD-COC-07', oilType: 'Coconut Oil', rawSeedWeightKg: 2800, quantityLiters: 1613, details: 'Standard copra batch #507', date: '2026-09-18' },
      { id: 'PRD-COC-08', oilType: 'Coconut Oil', rawSeedWeightKg: 3200, quantityLiters: 1844, details: 'Centrifuge filtered batch #508', date: '2026-09-24' },
      { id: 'PRD-COC-09', oilType: 'Coconut Oil', rawSeedWeightKg: 3600, quantityLiters: 2074, details: 'Commercial copra press #509', date: '2026-09-29' },
      { id: 'PRD-COC-10', oilType: 'Coconut Oil', rawSeedWeightKg: 4000, quantityLiters: 2305, details: 'High-grade coconut oil #510', date: '2026-10-05' },
      { id: 'PRD-COC-11', oilType: 'Coconut Oil', rawSeedWeightKg: 4400, quantityLiters: 2535, details: 'Bulk extraction batch #511', date: '2026-10-10' },
      { id: 'PRD-COC-12', oilType: 'Coconut Oil', rawSeedWeightKg: 4800, quantityLiters: 2766, details: 'Kerala copra commercial run #512', date: '2026-10-15' },
      { id: 'PRD-COC-13', oilType: 'Coconut Oil', rawSeedWeightKg: 5200, quantityLiters: 2996, details: 'Continuous expeller shift #513', date: '2026-10-20' },
      { id: 'PRD-COC-14', oilType: 'Coconut Oil', rawSeedWeightKg: 5600, quantityLiters: 3227, details: 'Commercial wholesale production #514', date: '2026-10-23' },
    ];

    // 4. Seed Historical Production Batches ONLY if demo mode is enabled
    if (shouldSeedDemo) {
      const prodCount = await Production.countDocuments();
      if (prodCount === 0) {
        for (const batch of productionBatches) {
          await Production.findOneAndUpdate({ id: batch.id }, { $set: batch }, { upsert: true });
        }
        console.log(`✅ [Database Seed] Successfully seeded ${productionBatches.length} production batches across all 5 oils.`);
      }
    }
    console.log('🎉 [Database Seed] Enterprise factory setup complete!');
  } catch (err) {
    console.error('⚠️ [Database Seed Error]:', err.message);
  }
};

// Allow direct standalone execution via CLI: node src/seed/seed.js or npm run seed
const isDirectRun = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('src/seed/seed.js');
if (isDirectRun) {
  process.env.SEED_DEMO_DATA = 'true';
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oilfactory';
  console.log(`🌿 [Standalone Seeder] Connecting to MongoDB: ${uri}`);
  mongoose
    .connect(uri)
    .then(async () => {
      console.log('Connected! Executing seeding process...');
      await seedDatabase();
      console.log(' Seeding finished successfully. Closing connection.');
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ [Standalone Seeder Error]:', err);
      process.exit(1);
    });
}

export default seedDatabase;
