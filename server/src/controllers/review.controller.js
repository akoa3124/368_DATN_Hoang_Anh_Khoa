const modelReview = require('../models/review.model');
const modelPost = require('../models/post.model');
const modelUser = require('../models/users.model');
const { OK, Created } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class controllerReview {
    async createReview(req, res) {
        const { id } = req.user;
        const { postId, rating, comment } = req.body;

        if (!postId || !rating) {
            throw new BadRequestError('Vui lòng gửi mã bài đăng và đánh giá');
        }

        const post = await modelPost.findById(postId);
        if (!post) {
            throw new BadRequestError('Bài đăng không tồn tại');
        }

        const ratingValue = Number(rating);
        if (ratingValue < 1 || ratingValue > 5) {
            throw new BadRequestError('Đánh giá phải từ 1 đến 5 sao');
        }

        const existing = await modelReview.findOne({ userId: id, postId });
        if (existing) {
            existing.rating = ratingValue;
            existing.comment = comment || existing.comment;
            await existing.save();
            return new OK({ message: 'Cập nhật đánh giá thành công', metadata: existing }).send(res);
        }

        const review = await modelReview.create({
            userId: id,
            postId,
            rating: ratingValue,
            comment: comment || '',
        });

        return new Created({ message: 'Đánh giá được lưu thành công', metadata: review }).send(res);
    }

    async deleteReview(req, res) {
        const { id } = req.user;
        const { reviewId } = req.body;
        if (!reviewId) {
            throw new BadRequestError('Vui lòng cung cấp mã đánh giá');
        }

        const review = await modelReview.findById(reviewId);
        if (!review) {
            throw new BadRequestError('Đánh giá không tồn tại');
        }
        if (review.userId.toString() !== id.toString()) {
            throw new BadRequestError('Bạn không có quyền xóa đánh giá này');
        }

        await modelReview.findByIdAndDelete(reviewId);
        return new OK({ message: 'Xóa đánh giá thành công' }).send(res);
    }

    async getReviewsByPost(req, res) {
        const { postId } = req.query;
        if (!postId) {
            throw new BadRequestError('Vui lòng cung cấp postId');
        }

        const reviews = await modelReview.find({ postId }).sort({ createdAt: -1 });
        const enriched = await Promise.all(
            reviews.map(async (item) => {
                const user = await modelUser.findById(item.userId);
                return {
                    _id: item._id,
                    rating: item.rating,
                    comment: item.comment,
                    createdAt: item.createdAt,
                    user: {
                        _id: user?._id,
                        fullName: user?.fullName || 'Người dùng',
                        avatar: user?.avatar || '',
                    },
                };
            }),
        );

        return new OK({ message: 'Danh sách đánh giá', metadata: enriched }).send(res);
    }
}

module.exports = new controllerReview();
