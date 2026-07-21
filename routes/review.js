const express = require('express');
const router = express.Router({ mergeParams: true });
const Review = require('../models/reviews');
const wrapAsync = require('../utils/wrapAsync');
const Listing = require('../models/listing');
const { validateReview,isloggedIn ,isAuthor} = require('../middleware.js');

router.post('/',isloggedIn,validateReview,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Successfully added a new review!");
    res.redirect(`/listings/${listing._id}`);
}));

router.delete('/:reviewId',isloggedIn,isAuthor,wrapAsync(async(req,res)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted a review!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;