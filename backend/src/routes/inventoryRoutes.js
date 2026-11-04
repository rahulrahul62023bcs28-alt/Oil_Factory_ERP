import express from 'express';
import { getInventory, updateItem } from '../controllers/inventoryController.js';

const router = express.Router();

router.get('/', getInventory);
router.put('/:id', updateItem);

export default router;
