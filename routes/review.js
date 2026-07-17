const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/reviews');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schema.js');
const Listing = require('../models/listing');

const ValidateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errmsg, 400);
    }
    next();
};

router.post('/',ValidateReview,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

router.delete('/:reviewId',wrapAsync(async(req,res)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;