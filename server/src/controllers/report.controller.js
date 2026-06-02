const modelPost = require('../models/post.model');
const modelRechargeUser = require('../models/RechargeUser.model');
const modelViolation = require('../models/violation.model');
const modelUser = require('../models/users.model');
const { BadRequestError } = require('../core/error.response');

function escapeCsv(value) {
    if (value === undefined || value === null) {
        return '';
    }
    const stringValue = value.toString();
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

function makeCsv(columns, rows) {
    const header = columns.map(escapeCsv).join(',');
    const body = rows
        .map((row) =>
            columns
                .map((column) => {
                    const value = row[column] === undefined ? '' : row[column];
                    return escapeCsv(value);
                })
                .join(','),
        )
        .join('\n');
    return `${header}\n${body}`;
}

class controllerReport {
    async exportReport(req, res) {
        const { type, status, startDate, endDate } = req.query;
        const fromDate = startDate ? new Date(startDate) : null;
        const toDate = endDate ? new Date(endDate) : null;

        let filename = 'report.csv';
        let csv = '';

        if (type === 'posts') {
            const filter = {};
            if (status) {
                filter.status = status;
            }
            if (fromDate || toDate) {
                filter.createdAt = {};
                if (fromDate) filter.createdAt.$gte = fromDate;
                if (toDate) filter.createdAt.$lte = toDate;
            }
            const posts = await modelPost.find(filter).sort({ createdAt: -1 });
            const rows = await Promise.all(
                posts.map(async (post) => {
                    const user = await modelUser.findById(post.userId);
                    return {
                        title: post.title,
                        category: post.category,
                        status: post.status,
                        price: post.price,
                        area: post.area,
                        location: post.location,
                        typeNews: post.typeNews,
                        createdAt: post.createdAt.toISOString(),
                        userEmail: user?.email || '',
                        userName: user?.fullName || '',
                    };
                }),
            );
            csv = makeCsv(
                [
                    'title',
                    'category',
                    'status',
                    'price',
                    'area',
                    'location',
                    'typeNews',
                    'createdAt',
                    'userName',
                    'userEmail',
                ],
                rows,
            );
            filename = 'posts-report.csv';
        } else if (type === 'transactions') {
            const filter = {};
            if (status) {
                filter.status = status;
            }
            if (fromDate || toDate) {
                filter.createdAt = {};
                if (fromDate) filter.createdAt.$gte = fromDate;
                if (toDate) filter.createdAt.$lte = toDate;
            }
            const transactions = await modelRechargeUser.find(filter).sort({ createdAt: -1 });
            const rows = await Promise.all(
                transactions.map(async (transaction) => {
                    const user = await modelUser.findById(transaction.userId);
                    return {
                        userName: user?.fullName || '',
                        userEmail: user?.email || '',
                        amount: transaction.amount,
                        typePayment: transaction.typePayment,
                        status: transaction.status,
                        createdAt: transaction.createdAt.toISOString(),
                    };
                }),
            );
            csv = makeCsv(
                ['userName', 'userEmail', 'amount', 'typePayment', 'status', 'createdAt'],
                rows,
            );
            filename = 'transactions-report.csv';
        } else if (type === 'violations') {
            const filter = {};
            if (status) {
                filter.status = status;
            }
            if (fromDate || toDate) {
                filter.createdAt = {};
                if (fromDate) filter.createdAt.$gte = fromDate;
                if (toDate) filter.createdAt.$lte = toDate;
            }
            const violations = await modelViolation.find(filter).sort({ createdAt: -1 });
            const rows = await Promise.all(
                violations.map(async (violation) => {
                    const post = await modelPost.findById(violation.postId);
                    const reporter = await modelUser.findById(violation.userId);
                    const reportedUser = await modelUser.findById(violation.reportedUserId);
                    return {
                        postTitle: post?.title || '',
                        postStatus: post?.status || '',
                        reporterName: reporter?.fullName || '',
                        reporterEmail: reporter?.email || '',
                        reportedName: reportedUser?.fullName || '',
                        reportedEmail: reportedUser?.email || '',
                        reason: violation.reason,
                        status: violation.status,
                        notes: violation.notes,
                        createdAt: violation.createdAt.toISOString(),
                        resolvedAt: violation.resolvedAt ? violation.resolvedAt.toISOString() : '',
                    };
                }),
            );
            csv = makeCsv(
                [
                    'postTitle',
                    'postStatus',
                    'reporterName',
                    'reporterEmail',
                    'reportedName',
                    'reportedEmail',
                    'reason',
                    'status',
                    'notes',
                    'createdAt',
                    'resolvedAt',
                ],
                rows,
            );
            filename = 'violations-report.csv';
        } else {
            throw new BadRequestError('Loại báo cáo không hợp lệ');
        }

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(csv);
    }
}

module.exports = new controllerReport();
