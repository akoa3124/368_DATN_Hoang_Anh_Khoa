const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerPayments = require('../controllers/payments.controller');

router.post('/payments', authUser, asyncHandler(controllerPayments.payments));
router.get('/check-payment-vnpay', asyncHandler(controllerPayments.checkPaymentVnpay));
router.route('/check-payment-momo')
    .get(asyncHandler(controllerPayments.checkPaymentMomo))
    .post(asyncHandler(controllerPayments.checkPaymentMomo));

module.exports = router;
