const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const interactionSchema = new Schema(
    {
        userId: { type: String, required: true, ref: 'user' },
        postId: { type: String, required: false, ref: 'posts' },
        action: {
            type: String,
            required: true,
            enum: ['view', 'chat', 'search', 'favourite'],
        },
        value: { type: Number, default: 1 },
        searchText: { type: String, default: '' },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('interaction', interactionSchema);
