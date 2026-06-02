const modelViolation = require('../models/violation.model');
const modelPost = require('../models/post.model');
const modelUser = require('../models/users.model');
const { BadRequestError } = require('../core/error.response');
const { Created, OK } = require('../core/success.response');

class controllerViolation {
    async reportViolation(req, res) {
        const { id } = req.user;
        const { postId, reason } = req.body;

        if (!postId || !reason) {
            throw new BadRequestError('Vui lòng cung cấp mã bài đăng và lý do báo cáo');
        }

        const post = await modelPost.findById(postId);
        if (!post) {
            throw new BadRequestError('Bài đăng không tồn tại');
        }

        const violation = await modelViolation.create({
            postId,
            userId: id,
            reportedUserId: post.userId,
            reason,
            status: 'pending',
        });

        return new Created({ message: 'Báo cáo vi phạm đã được gửi', metadata: violation }).send(res);
    }

    async getViolations(req, res) {
        const { status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }

        const violations = await modelViolation.find(filter).sort({ createdAt: -1 });
        const enriched = await Promise.all(
            violations.map(async (item) => {
                const post = await modelPost.findById(item.postId);
                const reporter = await modelUser.findById(item.userId);
                const reportedUser = await modelUser.findById(item.reportedUserId);
                return {
                    ...item._doc,
                    post: post
                        ? {
                              _id: post._id,
                              title: post.title,
                              status: post.status,
                          }
                        : null,
                    reporter: reporter
                        ? {
                              _id: reporter._id,
                              fullName: reporter.fullName,
                              email: reporter.email,
                          }
                        : null,
                    reportedUser: reportedUser
                        ? {
                              _id: reportedUser._id,
                              fullName: reportedUser.fullName,
                              email: reportedUser.email,
                          }
                        : null,
                };
            }),
        );

        return new OK({ message: 'Danh sách báo cáo vi phạm', metadata: enriched }).send(res);
    }

    async resolveViolation(req, res) {
        const { id } = req.user;
        const { violationId, status, notes } = req.body;

        if (!violationId || !status) {
            throw new BadRequestError('Vui lòng cung cấp mã báo cáo và trạng thái xử lý');
        }

        const violation = await modelViolation.findById(violationId);
        if (!violation) {
            throw new BadRequestError('Báo cáo không tồn tại');
        }

        if (!['resolved', 'rejected'].includes(status)) {
            throw new BadRequestError('Trạng thái không hợp lệ');
        }

        violation.status = status;
        violation.notes = notes || violation.notes;
        violation.resolvedBy = id;
        violation.resolvedAt = new Date();
        await violation.save();

        return new OK({ message: 'Cập nhật trạng thái báo cáo thành công', metadata: violation }).send(res);
    }
}

module.exports = new controllerViolation();
