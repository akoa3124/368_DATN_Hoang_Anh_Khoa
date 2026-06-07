const modelPost = require('../models/post.model');
const modelFavourite = require('../models/favourite.model');
const modelUser = require('../models/users.model');

const priceBuckets = [
    { name: 'duoi-1-trieu', min: 0, max: 1000000 },
    { name: 'tu-1-2-trieu', min: 1000000, max: 2000000 },
    { name: 'tu-2-3-trieu', min: 2000000, max: 3000000 },
    { name: 'tu-3-5-trieu', min: 3000000, max: 5000000 },
    { name: 'tu-5-7-trieu', min: 5000000, max: 7000000 },
    { name: 'tu-10-15-trieu', min: 10000000, max: 15000000 },
    { name: 'tren-15-trieu', min: 15000000, max: Infinity },
];

const areaBuckets = [
    { name: 'duoi-20', min: 0, max: 20 },
    { name: 'tu-20-30', min: 20, max: 30 },
    { name: 'tu-30-50', min: 30, max: 50 },
    { name: 'tu-50-70', min: 50, max: 70 },
    { name: 'tu-70-90', min: 70, max: 90 },
    { name: 'tren-90', min: 90, max: Infinity },
];

function getBucket(value, buckets) {
    const found = buckets.find((item) => value >= item.min && value < item.max);
    return found ? found.name : '';
}

function normalizeText(text) {
    return (text || '')
        .toLowerCase()
        .replace(/[\W_]+/g, ' ')
        .split(' ')
        .map((word) => word.trim())
        .filter((word) => word && word.length > 2);
}

function simplifyLocation(location) {
    if (!location) return '';
    const parts = location.split(',').map((part) => part.trim().toLowerCase()).filter(Boolean);
    return parts.slice(-2).join(', ');
}

function buildPostFeature(post) {
    const options = Array.isArray(post.options) ? post.options : [];
    const descriptionWords = normalizeText(post.description);
    const titleWords = normalizeText(post.title);
    const summaryWords = normalizeText(post.summary);
    const tagWords = Array.isArray(post.tags) ? post.tags.map((tag) => (tag || '').toLowerCase()) : [];
    const featureWords = [post.category, post.location, ...options];
    const tags = Array.from(new Set([
        ...featureWords.map((item) => (item || '').toLowerCase()),
        ...descriptionWords,
        ...titleWords,
        ...summaryWords,
        ...tagWords,
    ]));

    return {
        category: post.category || '',
        priceBucket: getBucket(post.price || 0, priceBuckets),
        areaBucket: getBucket(post.area || 0, areaBuckets),
        locationBucket: simplifyLocation(post.location),
        optionSet: new Set(options.map((item) => (item || '').toLowerCase())),
        tags,
        typeNews: post.typeNews || 'normal',
        roommate: Boolean(post.roommate),
        createdAt: post.createdAt || new Date(0),
    };
}

function scoreExactMatch(valueA, valueB) {
    if (!valueA || !valueB) return 0;
    return valueA === valueB ? 1 : 0;
}

function scoreBucketMatch(bucketA, bucketB) {
    if (!bucketA || !bucketB) return 0;
    if (bucketA === bucketB) return 1;
    return 0.4;
}

function scoreOverlap(setA, setB) {
    if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;
    let match = 0;
    for (const item of setA) {
        if (setB.has(item)) {
            match += 1;
        }
    }
    return match / Math.max(setA.size, setB.size);
}

function scoreTags(tagsA, tagsB) {
    if (!Array.isArray(tagsA) || !Array.isArray(tagsB) || tagsA.length === 0 || tagsB.length === 0) return 0;
    const setA = new Set(tagsA.map((tag) => tag.toLowerCase()));
    const setB = new Set(tagsB.map((tag) => tag.toLowerCase()));
    return scoreOverlap(setA, setB);
}

function calculateContentScore(profile, postFeature) {
    const categoryScore = scoreExactMatch(profile.category, postFeature.category) * 1.0;
    const locationScore = scoreExactMatch(profile.locationBucket, postFeature.locationBucket) * 1.0;
    const priceScore = scoreBucketMatch(profile.priceBucket, postFeature.priceBucket) * 0.95;
    const areaScore = scoreBucketMatch(profile.areaBucket, postFeature.areaBucket) * 0.75;
    const optionScore = scoreOverlap(profile.optionSet, postFeature.optionSet) * 0.9;
    const tagScore = scoreTags(profile.tags, postFeature.tags) * 0.9;
    const roommateScore = profile.roommate && postFeature.roommate ? 1 : 0;

    return Math.min(1, categoryScore + locationScore * 0.9 + priceScore + areaScore + optionScore + tagScore + roommateScore) / 5.7;
}

function calculateTextScore(profile, postFeature) {
    if (!profile.tags || profile.tags.length === 0) return 0;
    const setA = new Set(profile.tags.map((tag) => tag.toLowerCase()));
    const setB = new Set(postFeature.tags.map((tag) => tag.toLowerCase()));
    return scoreOverlap(setA, setB);
}

function calculateSimilarity(postA, postB) {
    const a = buildPostFeature(postA);
    const b = buildPostFeature(postB);
    const categoryScore = scoreExactMatch(a.category, b.category) * 1.0;
    const locationScore = scoreExactMatch(a.locationBucket, b.locationBucket) * 1.0;
    const priceScore = scoreBucketMatch(a.priceBucket, b.priceBucket) * 0.8;
    const areaScore = scoreBucketMatch(a.areaBucket, b.areaBucket) * 0.6;
    const optionScore = scoreOverlap(a.optionSet, b.optionSet) * 0.8;
    const tagScore = scoreTags(a.tags, b.tags) * 0.8;

    return Math.min(1, categoryScore + locationScore * 0.8 + priceScore + areaScore + optionScore + tagScore) / 4.5;
}

async function buildUserProfile(userId) {
    const user = await modelUser.findById(userId);
    if (!user) {
        return {
            category: '',
            priceBucket: '',
            areaBucket: '',
            locationBucket: '',
            optionSet: new Set(),
            tags: [],
            roommate: false,
            typeNewsPreference: 'normal',
        };
    }

    const favouriteDocs = await modelFavourite.find({ userId });
    const favouriteIds = favouriteDocs.map((item) => item.postId);
    const favouritePosts = favouriteIds.length
        ? await modelPost.find({ _id: { $in: favouriteIds }, status: 'active' })
        : [];

    const categoryFreq = {};
    const priceFreq = {};
    const areaFreq = {};
    const locationFreq = {};
    const optionSet = new Set();
    const tagSet = new Set();
    let roomCount = 0;
    let vipCount = 0;
    let normalCount = 0;

    for (const post of favouritePosts) {
        if (post.category) categoryFreq[post.category] = (categoryFreq[post.category] || 0) + 1;
        const bucketPrice = getBucket(post.price || 0, priceBuckets);
        if (bucketPrice) priceFreq[bucketPrice] = (priceFreq[bucketPrice] || 0) + 1;
        const bucketArea = getBucket(post.area || 0, areaBuckets);
        if (bucketArea) areaFreq[bucketArea] = (areaFreq[bucketArea] || 0) + 1;
        const loc = simplifyLocation(post.location);
        if (loc) locationFreq[loc] = (locationFreq[loc] || 0) + 1;
        if (post.roommate) roomCount += 1;
        if (post.typeNews === 'vip') vipCount += 1;
        if (post.typeNews === 'normal') normalCount += 1;

        const options = Array.isArray(post.options) ? post.options : [];
        options.forEach((item) => item && optionSet.add(item.toLowerCase()));
        const tags = Array.isArray(post.tags) ? post.tags.map((tag) => (tag || '').toLowerCase()) : [];
        tags.forEach((tag) => tagSet.add(tag));
        normalizeText(post.title).forEach((word) => tagSet.add(word));
        normalizeText(post.description).forEach((word) => tagSet.add(word));
        normalizeText(post.summary).forEach((word) => tagSet.add(word));
    }

    const pickMostFrequent = (freq) => Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const locationBucket = pickMostFrequent(locationFreq) || simplifyLocation(user.address);

    const preferences = {
        category: pickMostFrequent(categoryFreq),
        priceBucket: pickMostFrequent(priceFreq),
        areaBucket: pickMostFrequent(areaFreq),
        locationBucket,
        optionSet,
        tags: Array.from(tagSet),
        roommate: roomCount > favouritePosts.length / 2,
        typeNewsPreference: vipCount >= normalCount ? 'vip' : 'normal',
        favoriteCount: favouritePosts.length,
    };

    if (preferences.tags.length === 0 && user.address) {
        normalizeText(user.address).forEach((word) => preferences.tags.push(word));
    }

    return preferences;
}

async function calculateCFScore(userId, candidatePost, favouritePosts) {
    if (!Array.isArray(favouritePosts) || favouritePosts.length === 0) {
        return 0;
    }

    let sum = 0;
    for (const favPost of favouritePosts) {
        sum += calculateSimilarity(candidatePost, favPost);
    }

    return sum / favouritePosts.length;
}

function recencyBonus(post) {
    const createdAt = new Date(post.createdAt || new Date());
    const ageInHours = (Date.now() - createdAt.getTime()) / 1000 / 3600;
    if (ageInHours < 24) return 0.12;
    if (ageInHours < 72) return 0.08;
    if (ageInHours < 168) return 0.04;
    return 0;
}

function vipBonus(post) {
    return post.typeNews === 'vip' ? 0.08 : 0;
}

async function getPopularityMap(postIds) {
    if (!Array.isArray(postIds) || postIds.length === 0) return {};

    const counts = await modelFavourite.aggregate([
        { $match: { postId: { $in: postIds.map((id) => id.toString()) } } },
        { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);

    return counts.reduce((map, item) => {
        map[item._id] = item.count;
        return map;
    }, {});
}

async function getHybridRecommendations(userId, limit = 10) {
    const userProfile = await buildUserProfile(userId);
    const favouriteDocs = await modelFavourite.find({ userId });
    const favouriteIds = favouriteDocs.map((item) => item.postId);
    const favouritePosts = favouriteIds.length
        ? await modelPost.find({ _id: { $in: favouriteIds }, status: 'active' })
        : [];

    const candidateQuery = {
        status: 'active',
        userId: { $ne: userId },
    };
    if (favouriteIds.length > 0) {
        candidateQuery._id = { $nin: favouriteIds };
    }

    const candidatePosts = await modelPost.find(candidateQuery);
    const popularityMap = await getPopularityMap(candidatePosts.map((post) => post._id));

    const scoredPosts = candidatePosts.map((post) => {
        const postFeature = buildPostFeature(post);
        const contentScore = calculateContentScore(userProfile, postFeature);
        const textScore = calculateTextScore(userProfile, postFeature);
        const cfScore = favouritePosts.length ? calculateCFScore(userId, post, favouritePosts) : 0;
        const popularityScore = Math.min((popularityMap[post._id.toString()] || 0) / 5, 1) * 0.1;
        const typeNewsMatch = userProfile.typeNewsPreference === postFeature.typeNews ? 0.05 : 0;
        const finalScore =
            contentScore * 0.45 +
            textScore * 0.2 +
            cfScore * 0.15 +
            popularityScore +
            typeNewsMatch +
            recencyBonus(post) +
            vipBonus(post);

        return {
            post,
            score: finalScore,
            contentScore,
            textScore,
            cfScore,
            popularityScore,
        };
    });

    const sorted = scoredPosts.sort((a, b) => b.score - a.score).slice(0, Math.max(limit, 10));
    let recommendations = sorted
        .slice(0, limit)
        .map(({ post, score, contentScore, textScore, cfScore, popularityScore }) => ({
            ...post._doc,
            recommendationScore: Number(score.toFixed(4)),
            contentScore: Number(contentScore.toFixed(4)),
            textScore: Number(textScore.toFixed(4)),
            cfScore: Number(cfScore.toFixed(4)),
            popularityScore: Number(popularityScore.toFixed(4)),
        }));

    if (recommendations.length === 0) {
        recommendations = await modelPost
            .find({ status: 'active', userId: { $ne: userId } })
            .sort({ typeNews: -1, createdAt: -1 })
            .limit(limit)
            .lean();
    }

    return recommendations;
}

async function getRelatedRecommendations(postId, userId = null, limit = 4) {
    const currentPost = await modelPost.findById(postId);
    if (!currentPost) return [];

    const favouriteDocs = userId ? await modelFavourite.find({ userId }) : [];
    const favouriteIds = favouriteDocs.map((item) => item.postId);
    const favouritePosts = favouriteIds.length
        ? await modelPost.find({ _id: { $in: favouriteIds }, status: 'active' })
        : [];

    const candidatePosts = await modelPost.find({ status: 'active', _id: { $ne: currentPost._id } });
    const popularityMap = await getPopularityMap(candidatePosts.map((post) => post._id));
    const currentFeature = buildPostFeature(currentPost);

    const scoredPosts = candidatePosts.map((post) => {
        const postFeature = buildPostFeature(post);
        const similarity = calculateSimilarity(currentPost, post);
        const textScore = calculateTextScore({ tags: currentFeature.tags }, postFeature);
        const cfScore = favouritePosts.length ? calculateCFScore(userId, post, favouritePosts) : 0;
        const sameCategory = scoreExactMatch(currentFeature.category, postFeature.category) * 0.05;
        const sameLocation = scoreExactMatch(currentFeature.locationBucket, postFeature.locationBucket) * 0.05;
        const popularityScore = Math.min((popularityMap[post._id.toString()] || 0) / 5, 1) * 0.05;
        const finalScore =
            similarity * 0.55 +
            textScore * 0.15 +
            cfScore * 0.1 +
            sameCategory +
            sameLocation +
            popularityScore +
            recencyBonus(post) +
            vipBonus(post);

        return {
            post,
            score: finalScore,
            similarity,
            textScore,
            cfScore,
            popularityScore,
        };
    });

    let recommendations = scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ post, score, similarity, textScore, cfScore, popularityScore }) => ({
            ...post._doc,
            recommendationScore: Number(score.toFixed(4)),
            similarity: Number(similarity.toFixed(4)),
            textScore: Number(textScore.toFixed(4)),
            cfScore: Number(cfScore.toFixed(4)),
            popularityScore: Number(popularityScore.toFixed(4)),
        }));

    if (recommendations.length === 0) {
        recommendations = await modelPost
            .find({ status: 'active', _id: { $ne: currentPost._id } })
            .sort({ typeNews: -1, createdAt: -1 })
            .limit(limit)
            .lean();
    }

    return recommendations;
}

module.exports = {
    getHybridRecommendations,
    getRelatedRecommendations,
};
