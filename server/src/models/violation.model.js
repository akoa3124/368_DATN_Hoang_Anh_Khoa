const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const violationSchema = new Schema(
    {
        postId: { type: String, required: true },
        userId: { type: String, required: true },
        reportedUserId: { type: String, required: true },
        reason: { type: String, required: true },
        status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
        notes: { type: String, default: '' },
        resolvedBy: { type: String, default: '' },
        resolvedAt: { type: Date },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('violation', violationSchema);
