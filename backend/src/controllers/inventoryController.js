import Inventory from '../models/Inventory.js';

export const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ id: 1 });
    res.json({
      success: true,
      inventory,
    });
  } catch (err) {
    console.error('Get inventory error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory', error: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentLiters, capacityLiters, minAlert } = req.body;

    const numericId = Number(id);
    const updateFields = {};
    if (currentLiters !== undefined) updateFields.currentLiters = Number(currentLiters);
    if (capacityLiters !== undefined) updateFields.capacityLiters = Number(capacityLiters);
    if (minAlert !== undefined) updateFields.minAlert = Number(minAlert);

    const updated = await Inventory.findOneAndUpdate({ id: numericId }, updateFields, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: `Inventory item ${id} not found` });
    }

    // Emit real-time socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('inventory:updated', { item: updated });
    }

    res.json({
      success: true,
      message: 'Inventory updated successfully',
      item: updated,
    });
  } catch (err) {
    console.error('Update inventory error:', err);
    res.status(500).json({ success: false, message: 'Failed to update inventory', error: err.message });
  }
};

export default { getInventory, updateItem };
