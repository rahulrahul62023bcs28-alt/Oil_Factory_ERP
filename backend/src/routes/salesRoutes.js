import express from 'express';
import { getLogs, addSale } from '../controllers/salesController.js';

const router = express.Router();

router.get('/', getLogs);
router.post('/', addSale);

export default router;
