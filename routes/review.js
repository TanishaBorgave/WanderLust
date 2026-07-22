const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/reviews');
const wrapAsync = require('../utils/wrapAsync');
const Listing = require('../models/listing');
const ControllerReview = require('../controller/reviews');
const { validateReview,isloggedIn ,isAuthor} = require('../middleware.js');

router.post('/',isloggedIn,validateReview,wrapAsync(ControllerReview.createReview));

router.delete('/:reviewId',isloggedIn,isAuthor,wrapAsync(ControllerReview.deleteReview));

module.exports = router;