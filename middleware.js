const Listing = require('./models/listing');
const { listingSchema, reviewSchema } = require('./schema.js');
const Review = require("./models/review");
const ExpressError = require('./utils/ExpressError');


module.exports.isloggedIn = (req,res,next)=>{
    if (!req.isAuthenticated()) {
        req.session.originalUrl = req.originalUrl;
        
        req.flash("error", "You must be signed in!");
        return res.redirect('/login');
    }
    next();
}

module.exports.saveOriginalUrl= (req,res,next)=>{
    if(req.session.originalUrl){
        res.locals.originalUrl = req.session.originalUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(req.user._id)) {
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errmsg, 400);
    }
    next();
};

module.exports.isAuthor = async(req,res,next)=>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
