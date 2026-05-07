const modelInteraction = require('../models/interaction.model');

const actionWeights = {
    view: 1,
    search: 1.2,
    chat: 2,
    favourite: 3,
};

async function createInteraction({ userId, postId = null, action, value = 1, searchText = '' }) {
    if (!userId || !action) {
        throw new Error('userId và action là bắt buộc khi tạo interaction');
    }

    const interaction = await modelInteraction.create({
        userId,
        postId,
        action,
        value,
        searchText,
    });

    return interaction;
}

async function getUserInteractions(userId, actions = []) {
    const filter = { userId };
    if (Array.isArray(actions) && actions.length > 0) {
        filter.action = { $in: actions };
    }
    return await modelInteraction.find(filter).sort({ createdAt: -1 });
}

module.exports = {
    createInteraction,
    getUserInteractions,
    actionWeights,
};
