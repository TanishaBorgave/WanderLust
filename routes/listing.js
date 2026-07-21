const express = require('express');
const router = express.Router({ mergeParams: true });
const { isloggedIn } = require('../middleware.js');

const wrapAsync = require('../utils/wrapAsync');
const { listingSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressError');
const Listing = require('../models/listing');

const ValidateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el=> el.message).join(',');
        throw new ExpressError(errmsg, 400);
    }
    next();
};

router.get('/', wrapAsync(async (req, res) => {
    const listings = await Listing.find({})
    res.render('listing/listings.ejs', { listings })
}));

router.get('/new', isloggedIn, ValidateListing, (req, res) => {
    res.render('listing/new.ejs');
});

router.get('/:id',wrapAsync(async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews').populate('owner');
    if(!listing){
        req.flash("error", "Cannot find that listing!");
        return res.redirect('/listings');
    }
    console.log(listing);
    res.render('listing/show.ejs',{listing});
}));

router.post('/', isloggedIn,ValidateListing, wrapAsync(async (req, res, next) => {
    //const{title,description,image,price,location,country} = req.body;
    let listing = new Listing(req.body.listing);
    const user = req.user;
    listing.owner = user._id;
    await listing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect(`/listings`);
}));

router.get('/:id/edit',isloggedIn, ValidateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect('/listings');
    }
    res.render('listing/edit.ejs', { listing });
}));

router.put('/:id', isloggedIn, ValidateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings`);
}));

router.delete('/:id',isloggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect('/listings');
}));

module.exports = router;
