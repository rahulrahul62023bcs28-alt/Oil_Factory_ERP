import express from 'express';
import { getLogs, addBatch } from '../controllers/productionController.js';

const router = express.Router();

router.get('/', getLogs);
router.post('/', addBatch);

export default router;
