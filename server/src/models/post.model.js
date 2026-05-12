const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelPost = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        images: {
            type: Array,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['phong-tro', 'nha-nguyen-can', 'can-ho-chung-cu', 'can-ho-mini'],
        },
        location: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        area: {
            type: Number,
            required: true,
        },
        options: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        summary: {
            type: String,
            default: '',
        },
        features: {
            priceBucket: { type: String, default: '' },
            areaBucket: { type: String, default: '' },
            locationBucket: { type: String, default: '' },
            category: { type: String, default: '' },
            optionFlags: {
                type: Map,
                of: Boolean,
                default: {},
            },
        },
        roommate: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'inactive'],
        },
        typeNews: {
            type: String,
            required: true,
            enum: ['vip', 'normal'],
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('posts', modelPost);
