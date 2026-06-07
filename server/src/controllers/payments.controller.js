const axios = require('axios');
const crypto = require('crypto');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');

const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');

const modelUser = require('../models/users.model');
const modelRechargeUser = require('../models/RechargeUser.model');

const { v4: uuidv4 } = require('uuid');

class PaymentsController {
    async payments(req, res) {
        const { id } = req.user;
        const { typePayment, amountUser } = req.body;

        if (!typePayment) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        if (typePayment === 'MOMO') {
            const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            var partnerCode = 'MOMO';
            var accessKey = 'F8BBA842ECF85';
            var secretkey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
            var requestId = partnerCode + new Date().getTime();
            var orderId = requestId;
            var orderInfo = `nap tien ${id}`; // nội dung giao dịch thanh toán
            var redirectUrl = `${serverUrl}/api/check-payment-momo`;
            var ipnUrl = `${serverUrl}/api/check-payment-momo`;
            var amount = amountUser;
            var requestType = 'captureWallet';
            var extraData = ''; //pass empty value if your merchant does not have stores

            var rawSignature =
                'accessKey=' +
                accessKey +
                '&amount=' +
                amount +
                '&extraData=' +
                extraData +
                '&ipnUrl=' +
                ipnUrl +
                '&orderId=' +
                orderId +
                '&orderInfo=' +
                orderInfo +
                '&partnerCode=' +
                partnerCode +
                '&redirectUrl=' +
                redirectUrl +
                '&requestId=' +
                requestId +
                '&requestType=' +
                requestType;
            //puts raw signature

            //signature
            var signature = crypto.createHmac('sha256', secretkey).update(rawSignature).digest('hex');

            //json object send to MoMo endpoint
            const requestBody = JSON.stringify({
                partnerCode: partnerCode,
                accessKey: accessKey,
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                extraData: extraData,
                requestType: requestType,
                signature: signature,
                lang: 'en',
            });

            const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            new OK({ message: 'Thanh toán thông báo', metadata: response.data }).send(res);
        }
        if (typePayment === 'VNPAY') {
            const amount = Number(amountUser);
            if (!amount || amount <= 0) {
                throw new BadRequestError('Số tiền không hợp lệ');
            }

            const vnpay = new VNPay({
                tmnCode: 'MSWTIVKQ',
                secureSecret: 'NG14CBWVR55UOYWD4H0RVIS8OZJK883N',
                vnpayHost: 'https://sandbox.vnpayment.vn',
                testMode: true, // tùy chọn
                hashAlgorithm: 'SHA512', // tùy chọn
                loggerFn: ignoreLogger, // tùy chọn
            });
            const uuid = uuidv4();
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const vnpayPayload = {
                vnp_Amount: amount,
                vnp_IpAddr: '127.0.0.1', //
                vnp_TxnRef: `${id}-${uuid}`,
                vnp_OrderInfo: `nap tien ${id}`,
                vnp_OrderType: ProductCode.Other,
                vnp_ReturnUrl: `http://localhost:3000/api/check-payment-vnpay`, //
                vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
                vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
                vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
            };

            console.log('VNPAY DEBUG payload:', vnpayPayload);
            const vnpayResponse = await vnpay.buildPaymentUrl(vnpayPayload);
            const paymentUrl =
                typeof vnpayResponse === 'string'
                    ? vnpayResponse
                    : vnpayResponse?.url || vnpayResponse?.paymentUrl || vnpayResponse?.checkoutUrl || vnpayResponse;
            console.log('VNPAY DEBUG paymentUrl:', paymentUrl);
            new OK({ message: 'Thanh toán thông báo', metadata: paymentUrl }).send(res);
        }
    }

    async checkPaymentMomo(req, res, next) {
        const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        console.log('MOMO callback payload:', {
            method: req.method,
            query: req.query,
            body: req.body,
        });

        const source = req.method === 'POST' ? req.body : req.query;
        const orderInfo = source.orderInfo || source.orderDesc || '';
        const resultCode = source.resultCode ?? source.errorCode;
        const amount = source.amount || source.totalAmount || 0;
        const statusCode = String(resultCode ?? '').trim();
        const amountValue = Number(amount || 0);
        const userId = orderInfo?.split(' ')[2] || source.orderId || source.requestId || '';

        const orderId = source.orderId || source.requestId || '';
        const requestId = source.requestId || source.orderId || '';

        if (statusCode === '0' && userId && amountValue > 0) {
            let existingRecharge = null;
            if (orderId) {
                existingRecharge = await modelRechargeUser.findOne({ orderId, typePayment: 'MOMO', status: 'success' });
            } else if (requestId) {
                existingRecharge = await modelRechargeUser.findOne({ requestId, typePayment: 'MOMO', status: 'success' });
            }
            if (existingRecharge) {
                console.log('MOMO callback: duplicate callback ignored for orderId=', orderId, 'requestId=', requestId);
                return res.redirect(`${clientUrl}/trang-ca-nhan`);
            }

            const updatedUser = await modelUser.findByIdAndUpdate(
                userId,
                { $inc: { balance: amountValue } },
                { new: true, runValidators: false }
            );
            if (updatedUser) {
                await modelRechargeUser.create({
                    userId: updatedUser._id,
                    orderId,
                    requestId,
                    amount: amountValue,
                    typePayment: 'MOMO',
                    status: 'success',
                });

                const socket = global.usersMap.get(updatedUser._id.toString());
                if (socket) {
                    socket.emit('new-payment', {
                        userId: updatedUser._id,
                        amount: amountValue,
                        date: new Date(),
                        typePayment: 'MOMO',
                    });
                }

                console.log('MOMO callback: balance updated for userId=', userId, 'amount=', amountValue);
                return res.redirect(`${clientUrl}/trang-ca-nhan`);
            }
            console.error('MOMO callback: user not found for userId=', userId);
        } else {
            console.error('MOMO callback: invalid payment status or amount', { statusCode, userId, amountValue });
        }

        return res.redirect(`${clientUrl}/trang-ca-nhan?status=failed`);
    }

    async checkPaymentVnpay(req, res) {
        const { vnp_ResponseCode, vnp_OrderInfo, vnp_Amount } = req.query;

        if (vnp_ResponseCode === '00') {
            const result = vnp_OrderInfo.split(' ')[2];
            const amountValue = Number(vnp_Amount.slice(0, -2));
            const updatedUser = await modelUser.findByIdAndUpdate(
                result,
                { $inc: { balance: amountValue } },
                { new: true, runValidators: false }
            );
            if (updatedUser) {
                const socket = global.usersMap.get(updatedUser._id.toString());
                await modelRechargeUser.create({
                    userId: updatedUser._id,
                    amount: amountValue,
                    typePayment: 'VNPAY',
                    status: 'success',
                });
                if (socket) {
                    socket.emit('new-payment', {
                        userId: updatedUser._id,
                        amount: amountValue,
                        date: new Date(),
                        typePayment: 'VNPAY',
                    });
                }
                return res.redirect(`http://localhost:5173/trang-ca-nhan`);
            }
            console.error('VNPAY callback: user not found for userId=', result);
        }
    }
}
module.exports = new PaymentsController();
