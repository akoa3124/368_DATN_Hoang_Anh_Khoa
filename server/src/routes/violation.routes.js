const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');
const controllerViolation = require('../controllers/violation.controller');

router.post('/report-violation', authUser, asyncHandler(controllerViolation.reportViolation));
router.get('/get-violations', authAdmin, asyncHandler(controllerViolation.getViolations));
router.post('/resolve-violation', authAdmin, asyncHandler(controllerViolation.resolveViolation));

module.exports = router;
