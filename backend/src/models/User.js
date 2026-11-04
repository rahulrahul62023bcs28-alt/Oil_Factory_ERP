import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['Administrator', 'Factory Manager', 'Factory Staff'],
      default: 'Factory Staff',
    },
    avatar: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'General Operations',
    },
    dept: {
      type: String,
      default: 'General Operations',
    },
    shift: {
      type: String,
      default: 'General Shift (08:00 - 17:00)',
      trim: true,
    },
    allocatedMachine: {
      type: String,
      default: 'Factory Floor',
      trim: true,
    },
    attendance: {
      type: String,
      default: 'Present',
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook: ensure id and dept are synchronized
userSchema.pre('save', function (next) {
  if (!this.id) {
    this.id = `EMP-${Date.now().toString().slice(-4)}`;
  }
  if (!this.dept && this.department) {
    this.dept = this.department;
  } else if (!this.department && this.dept) {
    this.department = this.dept;
  }
  next();
});

// Helper method to output clean user object without password hash
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  if (!obj.id) {
    obj.id = this._id.toString();
  }
  if (!obj.dept) {
    obj.dept = obj.department || 'Operations';
  }
  return obj;
};

export const User = mongoose.model('User', userSchema);
export default User;
