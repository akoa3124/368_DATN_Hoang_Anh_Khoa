const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelUser = new Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        address: { type: String, default: '' },
        avatar: { type: String, default: '' },
        phone: { type: String, default: '' },
        role: { type: String, enum: ['seeker', 'owner', 'admin'], default: 'seeker' },
        isAdmin: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        balance: { type: Number, default: 0 },
        typeLogin: { type: String, enum: ['email', 'google'], default: 'email' },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('user', modelUser);
