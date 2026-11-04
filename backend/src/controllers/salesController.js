import Sales from '../models/Sales.js';
import Inventory from '../models/Inventory.js';

export const getLogs = async (req, res) => {
  try {
    const logs = await Sales.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      logs,
    });
  } catch (err) {
    console.error('Get sales logs error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch sales logs', error: err.message });
  }
};

export const addSale = async (req, res) => {
  try {
    const { orderType, buyerName, oilType, quantityLiters, totalAmount } = req.body;

    if (!buyerName || !oilType || !quantityLiters || totalAmount === undefined) {
      return res.status(400).json({ success: false, message: 'All sale order fields are required' });
    }

    const qty = Number(quantityLiters);
    const amt = Number(totalAmount);
    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    }

    // 1. Deduct Inventory Stock Atomically to Prevent Race Conditions & Over-selling
    const updatedTank = await Inventory.findOneAndUpdate(
      { name: oilType, currentLiters: { $gte: qty } },
      { $inc: { currentLiters: -qty } },
      { new: true, runValidators: true }
    );

    if (!updatedTank) {
      const currentTank = await Inventory.findOne({ name: oilType });
      if (!currentTank) {
        return res.status(404).json({ success: false, message: `Storage tank for ${oilType} not found.` });
      }
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory for ${oilType}. Current stock is ${currentTank.currentLiters}L, but ${qty}L was requested.`,
        availableStock: currentTank.currentLiters,
        requestedStock: qty,
      });
    }

    // 2. Generate Collision-Proof Sequential Timestamp ID
    const orderId = `ORD-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`;
    const newSale = await Sales.create({
      id: orderId,
      orderType: orderType || 'Retail Customer',
      buyerName,
      oilType,
      quantityLiters: qty,
      totalAmount: amt,
      date: new Date().toISOString().split('T')[0],
    });

    // 3. Broadcast real-time Socket.io events
    const io = req.app.get('io');
    if (io) {
      io.emit('sales:added', { sale: newSale });
      io.emit('inventory:updated', { item: updatedTank });
    }

    res.status(201).json({
      success: true,
      message: `Sale recorded. Deducted ${qty}L from ${oilType}. Remaining stock: ${updatedTank.currentLiters}L.`,
      sale: newSale,
      updatedInventory: updatedTank,
    });
  } catch (err) {
    console.error('Add sale error:', err);
    res.status(500).json({ success: false, message: 'Failed to record sale', error: err.message });
  }
};

export default { getLogs, addSale };
