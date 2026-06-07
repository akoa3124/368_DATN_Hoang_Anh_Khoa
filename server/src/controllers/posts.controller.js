const modelPost = require('../models/post.model');
const modelUser = require('../models/users.model');
const modelFavourite = require('../models/favourite.model');
const modelReview = require('../models/review.model');

const { OK, Created } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const SendMailApprove = require('../utils/SendMail/SendMailApprove');
const SendMailReject = require('../utils/SendMail/SendMailReject');
const recommendationService = require('../services/recommendation.service');
const { AiGenerateTagsAndSummary } = require('../utils/AISearch/AISearch');

const pricePostVip = [
    { date: 3, price: 50000 },
    { date: 7, price: 315000 },
    { date: 30, price: 1200000 },
];

const pricePostNormal = [
    { date: 3, price: 10000 },
    { date: 7, price: 60000 },
    { date: 30, price: 1000000 },
];

function buildBucket(value, buckets) {
    for (const bucket of buckets) {
        if (bucket.condition(value)) {
            return bucket.label;
        }
    }
    return 'other';
}

function buildPostFeatures({ price, area, location, category, options }) {
    const normalizedLocation = location ? location.toString().trim().toLowerCase() : '';
    const normalizedOptions = Array.isArray(options) ? options : [];

    return {
        priceBucket: buildBucket(price, [
            { condition: (v) => v < 1000000, label: 'duoi-1-trieu' },
            { condition: (v) => v >= 1000000 && v < 2000000, label: '1-2-trieu' },
            { condition: (v) => v >= 2000000 && v < 3000000, label: '2-3-trieu' },
            { condition: (v) => v >= 3000000 && v < 5000000, label: '3-5-trieu' },
            { condition: (v) => v >= 5000000 && v < 7000000, label: '5-7-trieu' },
            { condition: (v) => v >= 7000000 && v < 10000000, label: '7-10-trieu' },
            { condition: (v) => v >= 10000000 && v < 15000000, label: '10-15-trieu' },
            { condition: (v) => v >= 15000000, label: 'tren-15-trieu' },
        ]),
        areaBucket: buildBucket(area, [
            { condition: (v) => v < 20, label: 'duoi-20' },
            { condition: (v) => v >= 20 && v < 30, label: '20-30' },
            { condition: (v) => v >= 30 && v < 50, label: '30-50' },
            { condition: (v) => v >= 50 && v < 70, label: '50-70' },
            { condition: (v) => v >= 70 && v < 90, label: '70-90' },
            { condition: (v) => v >= 90, label: 'tren-90' },
        ]),
        locationBucket: normalizedLocation,
        category: category ? category.toString().trim().toLowerCase() : '',
        optionFlags: normalizedOptions.reduce((acc, option) => {
            const key = option.toString().trim().toLowerCase().replace(/\s+/g, '_');
            if (key) acc[key] = true;
            return acc;
        }, {}),
    };
}

class controllerPosts {
    async createPost(req, res) {
        const { id } = req.user;
        const {
            title,
            description,
            price,
            images,
            category,
            area,
            username,
            phone,
            options,
            location,
            endDate,
            typeNews,
            dateEnd,
            roommate,
        } = req.body;
        if (
            !title ||
            !description ||
            !price ||
            !images ||
            !category ||
            !area ||
            !username ||
            !phone ||
            !options ||
            !location ||
            !endDate ||
            !typeNews ||
            !dateEnd
        ) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const user = await modelUser.findById(id);
        if (!user) {
            throw new BadRequestError('User not found');
        }

        const pricePost =
            typeNews === 'vip'
                ? pricePostVip.find((item) => item.date === dateEnd)
                : pricePostNormal.find((item) => item.date === dateEnd);

        if (user.balance < pricePost.price) {
            throw new BadRequestError('Số dư không đủ');
        }

        const metadata = await AiGenerateTagsAndSummary({
            title,
            description,
            category,
            location,
            options,
        });

        const features = buildPostFeatures({ price, area, location, category, options });

        const post = await modelPost.create({
            title,
            description,
            price,
            location,
            images,
            category,
            area,
            username,
            phone,
            options,
            roommate: Boolean(roommate),
            tags: metadata.tags,
            summary: metadata.summary,
            features,
            status: 'pending',
            userId: id,
            endDate: endDate ? endDate : null,
            typeNews,
        });
        await modelUser.findByIdAndUpdate(id, { $inc: { balance: -pricePost.price } });
        return new Created({
            message: 'Post created successfully',
            metadata: post,
        }).send(res);
    }

    async getPosts(req, res) {
        const { category, priceRange, areaRange, typeNews, roommate } = req.query;

        const filter = { status: 'active' };

        if (category) {
            filter.category = category;
        }

        if (typeNews) {
            filter.typeNews = typeNews;
        }

        if (roommate === 'true' || roommate === true) {
            filter.roommate = true;
        }

        if (priceRange) {
            const priceConditions = {
                'duoi-1-trieu': { $lt: 1000000 },
                'tu-1-2-trieu': { $gte: 1000000, $lt: 2000000 },
                'tu-2-3-trieu': { $gte: 2000000, $lt: 3000000 },
                'tu-3-5-trieu': { $gte: 3000000, $lt: 5000000 },
                'tu-5-7-trieu': { $gte: 5000000, $lt: 7000000 },
                'tu-7-10-trieu': { $gte: 7000000, $lt: 10000000 },
                'tu-10-15-trieu': { $gte: 10000000, $lt: 15000000 },
                'tren-15-trieu': { $gte: 15000000 },
            };
            if (priceConditions[priceRange]) {
                filter.price = priceConditions[priceRange];
            }
        }

        // Implement area filtering now that 'area' field is Number type
        if (areaRange) {
            const areaConditions = {
                'duoi-20': { $lt: 20 },
                'tu-20-30': { $gte: 20, $lt: 30 },
                'tu-30-50': { $gte: 30, $lt: 50 },
                'tu-50-70': { $gte: 50, $lt: 70 },
                'tu-70-90': { $gte: 70, $lt: 90 },
                'tren-90': { $gte: 90 },
            };
            if (areaConditions[areaRange]) {
                filter.area = areaConditions[areaRange];
            }
        }

        const dataPost = await modelPost.find(filter).sort({ createdAt: -1 });

        const data = await Promise.all(
            dataPost.map(async (item) => {
                const user = await modelUser.findById(item.userId);
                return { ...item._doc, user: { _id: user._id, fullName: user.fullName, avatar: user.avatar } };
            }),
        );

        return new OK({
            message: 'Posts fetched successfully',
            metadata: data,
        }).send(res);
    }

    async getPostById(req, res) {
        const { id } = req.query;
        const data = await modelPost.findById(id);
        if (!data) {
            throw new BadRequestError('Bài đăng không tồn tại');
        }

        const findUser = await modelUser.findById(data.userId);
        const findFavourite = await modelFavourite.find({ postId: id });
        const reviewStats = await modelReview.aggregate([
            { $match: { postId: id } },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                },
            },
        ]);

        const userFavourite = findFavourite.map((item) => item.userId);
        const lengthPost = await modelPost.countDocuments({ userId: data.userId });
        let statusUser = '';
        const socket = global.usersMap.get(findUser._id.toString());

        if (socket) {
            statusUser = 'Đang hoạt động';
        } else {
            statusUser = 'Đang offline';
        }
        const dataUser = {
            _id: findUser._id,
            username: findUser.fullName,
            avatar: findUser.avatar,
            createdAt: findUser.createdAt,
            phone: findUser.phone,
            lengthPost,
            status: statusUser,
        };

        const reviewCount = reviewStats.length ? reviewStats[0].count : 0;
        const averageRating = reviewStats.length ? Number(reviewStats[0].avgRating.toFixed(1)) : 0;
        const relatedPosts = await recommendationService.getRelatedRecommendations(id, req.user?.id, 4);

        return new OK({
            message: 'Post fetched successfully',
            metadata: {
                data,
                dataUser,
                userFavourite,
                reviewCount,
                averageRating,
                relatedPosts,
            },
        }).send(res);
    }

    async getPostByUserId(req, res) {
        const { id } = req.user;
        const data = await modelPost.find({ userId: id });
        return new OK({
            message: 'Post fetched successfully',
            metadata: data,
        }).send(res);
    }

    async getNewPost(req, res) {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 3);

        const data = await modelPost
            .find({
                createdAt: { $gte: fiveDaysAgo },
                status: 'active',
            })
            .sort({ createdAt: -1 })
            .limit(8);

        return new OK({
            message: 'Post fetched successfully',
            metadata: data,
        }).send(res);
    }

    async getPostVip(req, res) {
        const data = await modelPost.find({ typeNews: 'vip' }).limit(5);
        return new OK({
            message: 'Post fetched successfully',
            metadata: data,
        }).send(res);
    }

    async deletePost(req, res) {
        const { id } = req.body;
        const findPost = await modelPost.findById(id);
        if (!findPost) {
            throw new BadRequestError('Post not found');
        }
        await modelPost.findByIdAndDelete(id);
        await modelFavourite.deleteMany({ postId: id });
        await modelUser.findByIdAndUpdate(findPost.userId, { $inc: { balance: findPost.price } });
        return new OK({
            message: 'Xoá bài viết thành công',
            metadata: findPost,
        }).send(res);
    }

    async getAllPosts(req, res) {
        const { status } = req.query;
        const filter = {};
        if (status) {
            if (status === 'pending') {
                filter.status = { $in: ['pending', 'inactive'] };
            } else {
                filter.status = status;
            }
        }
        const data = await modelPost.find(filter);
        return new OK({
            message: 'Posts fetched successfully',
            metadata: data,
        }).send(res);
    }

    async approvePost(req, res) {
        const { id } = req.body;
        const findPost = await modelPost.findById(id);
        if (!findPost) {
            throw new BadRequestError('Post not found');
        }
        const findUser = await modelUser.findById(findPost.userId);
        await modelPost.findByIdAndUpdate(id, { status: 'active' });
        if (findUser) {
            await SendMailApprove(findUser.email, findPost);
        }
        return new OK({
            message: 'Duyệt bài viết thành công',
            metadata: findPost,
        }).send(res);
    }

    async rejectPost(req, res) {
        const { id, reason } = req.body;
        const findPost = await modelPost.findById(id);
        if (!findPost) {
            throw new BadRequestError('Post not found');
        }
        const findUser = await modelUser.findById(findPost.userId);
        await modelPost.findByIdAndUpdate(id, { status: 'cancel' });
        if (findUser) {
            await SendMailReject(findUser.email, findPost, reason);
        }
        return new OK({
            message: 'Từ chối bài viết thành công',
            metadata: findPost,
        }).send(res);
    }

    async postSuggest(req, res) {
        const { id } = req.user;
        const recommendations = await recommendationService.getHybridRecommendations(id, 10);

        return new OK({
            message: 'Post fetched successfully',
            metadata: recommendations,
        }).send(res);
    }
}

module.exports = new controllerPosts();
