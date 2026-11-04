import Supplier from '../models/Supplier.js';

export const getLogs = async (req, res) => {
  try {
    const logs = await Supplier.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      logs,
    });
  } catch (err) {
    console.error('Get supplier logs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch supplier logs', error: err.message });
  }
};

export const addIntake = async (req, res) => {
  try {
    const { supplierName, materialItem, quantity, totalCost } = req.body;

    if (!supplierName || !materialItem || !quantity || totalCost === undefined) {
      return res.status(400).json({ success: false, message: 'All supplier purchase fields are required' });
    }

    const supId = `SUP-${Date.now().toString().slice(-6)}`;

    const newIntake = await Supplier.create({
      id: supId,
      supplierName,
      materialItem,
      quantity,
      totalCost: Number(totalCost),
      date: new Date().toISOString().split('T')[0],
    });

    // Broadcast real-time Socket.io event
    const io = req.app.get('io');
    if (io) {
      io.emit('supplier:added', { intake: newIntake });
    }

    res.status(201).json({
      success: true,
      message: `Supplier purchase from ${supplierName} recorded.`,
      intake: newIntake,
    });
  } catch (err) {
    console.error('Add supplier intake error:', err);
    res.status(500).json({ success: false, message: 'Failed to record supplier intake', error: err.message });
  }
};

export default { getLogs, addIntake };
