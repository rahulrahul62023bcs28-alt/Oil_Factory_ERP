import express from 'express';
import { getLogs, addIntake } from '../controllers/supplierController.js';

const router = express.Router();

router.get('/', getLogs);
router.post('/', addIntake);

export default router;
