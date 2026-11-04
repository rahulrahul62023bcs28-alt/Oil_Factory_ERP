import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const getEmployees = async (req, res) => {
  try {
    if (req.user && req.user.role === 'Factory Staff') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Factory Staff are not authorized to view the users directory.',
      });
    }

    const users = await User.find().select('-password').sort({ createdAt: 1 });
    const employees = users.map((u) => {
      const obj = u.toObject();
      delete obj.password;
      if (!obj.id) obj.id = obj._id.toString();
      if (!obj.dept) obj.dept = obj.department || 'Operations';
      return obj;
    });

    res.json({
      success: true,
      employees,
    });
  } catch (err) {
    console.error('Get employees/users error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch accounts from users collection', error: err.message });
  }
};

export const addEmployee = async (req, res) => {
  try {
    if (req.user && req.user.role !== 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Administrators have access to create new users.',
      });
    }

    const { name, role, email, dept, shift, allocatedMachine, username, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username?.trim() || cleanEmail.split('@')[0];

    // Check if account already exists in users collection
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `An account with email "${cleanEmail}" or username "${cleanUsername}" already exists.`,
      });
    }

    const allowedRoles = ['Factory Staff', 'Factory Manager'];
    const assignedRole = allowedRoles.includes(role) ? role : 'Factory Staff';

    const timestampSuffix = Date.now().toString().slice(-4);
    const empId = `EMP-${timestampSuffix}`;
    const pass = password || 'Default@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);

    const newUser = await User.create({
      id: empId,
      name: name.trim(),
      role: assignedRole,
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
      department: dept || 'Operations',
      dept: dept || 'Operations',
      shift: shift || 'General Shift (08:00 - 17:00)',
      allocatedMachine: allocatedMachine || 'Factory Floor',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${cleanEmail}`,
      status: 'Active',
    });

    const safeUser = newUser.toSafeObject();

    const io = req.app.get('io');
    if (io) {
      io.emit('employee:added', { employee: safeUser });
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully in users collection',
      employee: safeUser,
    });
  } catch (err) {
    console.error('Add user account error:', err);
    res.status(500).json({ success: false, message: 'Failed to create user account', error: err.message });
  }
};

export const removeEmployee = async (req, res) => {
  try {
    if (req.user && req.user.role !== 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only Administrators have access to delete users.',
      });
    }

    const { id } = req.params;
    const cleanId = (id || '').trim();

    const query = {
      $or: [{ id: cleanId }, { email: cleanId.toLowerCase() }, { username: cleanId }],
    };
    if (mongoose.isValidObjectId(cleanId)) {
      query.$or.push({ _id: cleanId });
    }

    // Do not allow deleting Administrator accounts
    const targetUser = await User.findOne(query);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: `Account with id ${id} not found` });
    }
    if (targetUser.role === 'Administrator') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be deleted.',
      });
    }

    const removed = await User.findOneAndDelete(query);

    const io = req.app.get('io');
    if (io) {
      io.emit('employee:removed', { id: removed.id || cleanId, _id: removed._id, email: removed.email });
    }

    res.json({
      success: true,
      message: 'Account removed successfully from users collection',
      id: removed.id || cleanId,
    });
  } catch (err) {
    console.error('Remove user error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove user account', error: err.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendance } = req.body;

    const query = {
      $or: [{ id }],
    };
    if (mongoose.isValidObjectId(id)) {
      query.$or.push({ _id: id });
    }

    const updated = await User.findOneAndUpdate(query, { attendance }, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: `Account ${id} not found` });
    }

    const safeUser = updated.toSafeObject();
    const io = req.app.get('io');
    if (io) {
      io.emit('employee:updated', { employee: safeUser });
    }

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      employee: safeUser,
    });
  } catch (err) {
    console.error('Update attendance error:', err);
    res.status(500).json({ success: false, message: 'Failed to update attendance', error: err.message });
  }
};

export default { getEmployees, addEmployee, removeEmployee, updateAttendance };
