import express from 'express';
import {
  getEmployees,
  addEmployee,
  removeEmployee,
  updateAttendance,
} from '../controllers/employeeController.js';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole(['Administrator', 'Factory Manager']), getEmployees);
router.post('/', authenticateToken, requireRole(['Administrator']), addEmployee);
router.delete('/:id', authenticateToken, requireRole(['Administrator']), removeEmployee);
router.patch('/:id/attendance', authenticateToken, requireRole(['Administrator', 'Factory Manager']), updateAttendance);

export default router;

