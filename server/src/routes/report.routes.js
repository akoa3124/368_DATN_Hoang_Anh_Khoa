const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin } = require('../auth/checkAuth');
const controllerReport = require('../controllers/report.controller');

router.get('/', authAdmin, asyncHandler(controllerReport.exportReport));

module.exports = router;
