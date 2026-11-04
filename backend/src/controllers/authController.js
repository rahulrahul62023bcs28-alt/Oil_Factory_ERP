import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'oilsync_enterprise_jwt_secret_key_2026_raghul_secure';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password' });
    }

    let trimmed = identifier.trim().toLowerCase();
    // Support common typo alias: raghuluma2006@gmil.com -> raghuluma2006@gmail.com
    if (trimmed === 'raghuluma2006@gmil.com') {
      trimmed = 'raghuluma2006@gmail.com';
    }

    // Find by email or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: trimmed },
        { username: { $regex: new RegExp(`^${identifier.trim()}$`, 'i') } }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    // Compare bcrypt password (or direct match fallback for initial seed / preset)
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false) || (user.password === password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check your credentials.' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: `Account is ${user.status}. Please contact administrator.` });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login', error: err.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required for Google login' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const generatedUsername = email.split('@')[0];
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

      user = await User.create({
        email: email.toLowerCase(),
        username: generatedUsername,
        password: randomPassword,
        name: name || generatedUsername,
        role: email.toLowerCase() === 'raghuluma2006@gmail.com' ? 'Administrator' : 'Factory Staff',
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
        department: 'Operations',
        status: 'Active',
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ success: false, message: 'Google authentication failed', error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile', error: err.message });
  }
};

export const getAccountsPool = async (req, res) => {
  try {
    const users = await User.find({ status: 'Active' }).select('-password').sort({ role: 1 });
    res.json({
      success: true,
      accounts: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch accounts pool', error: err.message });
  }
};

export const registerCredentials = async (req, res) => {
  try {
    const { name, email, username, password, role, dept, shift, allocatedMachine } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username?.trim() }]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email or username already exists' });
    }

    const allowedRoles = ['Factory Staff', 'Factory Manager'];
    const assignedRole = allowedRoles.includes(role) ? role : 'Factory Staff';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const empId = `EMP-${Date.now().toString().slice(-4)}`;

    const newUser = await User.create({
      id: empId,
      name: name || username,
      email: email.toLowerCase().trim(),
      username: username?.trim() || email.split('@')[0],
      password: hashedPassword,
      role: assignedRole,
      department: dept || 'Operations',
      dept: dept || 'Operations',
      shift: shift || 'General Shift (08:00 - 17:00)',
      allocatedMachine: allocatedMachine || 'Factory Floor',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`,
      status: 'Active',
    });

    const safeUser = newUser.toSafeObject();

    // Broadcast live event if Socket.io exists
    const io = req.app.get('io');
    if (io) {
      io.emit('employee:added', { employee: safeUser });
    }

    res.status(201).json({
      success: true,
      message: 'Credentials created successfully',
      user: newUser.toSafeObject(),
    });
  } catch (err) {
    console.error('Register credentials error:', err);
    res.status(500).json({ success: false, message: 'Failed to create credentials', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, department, avatar } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (email && email.toLowerCase().trim() !== req.user?.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: userId } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'This email is already in use by another account' });
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (email) updateFields.email = email.toLowerCase().trim();
    if (department) updateFields.department = department.trim();
    if (avatar) updateFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: err.message });
  }
};

export default {
  login,
  googleAuth,
  getMe,
  getAccountsPool,
  registerCredentials,
  updateProfile,
};
