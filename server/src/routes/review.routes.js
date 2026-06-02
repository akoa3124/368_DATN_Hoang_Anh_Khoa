const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');
const controllerReview = require('../controllers/review.controller');

router.post('/api/create-review', authUser, asyncHandler(controllerReview.createReview));
router.post('/api/delete-review', authUser, asyncHandler(controllerReview.deleteReview));
router.get('/api/get-reviews', asyncHandler(controllerReview.getReviewsByPost));

module.exports = router;
