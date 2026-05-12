const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelReview = new Schema(
    {
        userId: { type: String, required: true },
        postId: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '' },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('review', modelReview);
