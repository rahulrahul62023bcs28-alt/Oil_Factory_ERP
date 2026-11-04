import Production from '../models/Production.js';
import Inventory from '../models/Inventory.js';

export const getLogs = async (req, res) => {
  try {
    const logs = await Production.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      logs,
    });
  } catch (err) {
    console.error('Get production logs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch production logs', error: err.message });
  }
};

export const addBatch = async (req, res) => {
  try {
    const { oilType, quantityLiters, rawSeedWeightKg, details } = req.body;

    if (!oilType || !quantityLiters) {
      return res.status(400).json({ success: false, message: 'Oil type and quantity in liters are required' });
    }

    const qty = Number(quantityLiters);
    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    }

    const seedKg = Number(rawSeedWeightKg) > 0 ? Number(rawSeedWeightKg) : Math.round(qty * 2.35);

    const batchId = `PRD-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
    const newBatch = await Production.create({
      id: batchId,
      oilType,
      rawSeedWeightKg: seedKg,
      quantityLiters: qty,
      details: details || `${oilType} Production Batch`,
      date: new Date().toISOString().split('T')[0],
    });

    // Automatically increase inventory stock for this oil category
    const tank = await Inventory.findOne({ name: oilType });
    let updatedTank = null;
    if (tank) {
      tank.currentLiters = Math.min(tank.capacityLiters, tank.currentLiters + qty);
      updatedTank = await tank.save();
    }

    // Broadcast real-time Socket.io events
    const io = req.app.get('io');
    if (io) {
      io.emit('production:added', { batch: newBatch });
      if (updatedTank) {
        io.emit('inventory:updated', { item: updatedTank });
      }
    }

    res.status(201).json({
      success: true,
      message: `Production batch recorded. Added ${qty}L to ${oilType}.`,
      batch: newBatch,
      updatedInventory: updatedTank,
    });
  } catch (err) {
    console.error('Add production batch error:', err);
    res.status(500).json({ success: false, message: 'Failed to add production batch', error: err.message });
  }
};

export default { getLogs, addBatch };
