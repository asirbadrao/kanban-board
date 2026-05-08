const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['admin', 'member'], default: 'member' },
      },
    ],
    background: {
      type: String,
      default: '#6366f1',
    },
  },
  { timestamps: true }
);

// Ensure owner is always in members
boardSchema.pre('save', function (next) {
  const ownerExists = this.members.some(
    (m) => m.user.toString() === this.owner.toString()
  );
  if (!ownerExists) {
    this.members.push({ user: this.owner, role: 'admin' });
  }
  next();
});

module.exports = mongoose.model('Board', boardSchema);
