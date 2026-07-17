const express = require('express');
const router = express.Router({ mergeParams: true });

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

router.get('/new', ValidateListing, (req, res) => {
    res.render('listing/new.ejs');
})

router.get('/:id',wrapAsync(async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    res.render('listing/show.ejs',{listing});
}));

router.post('/', ValidateListing, wrapAsync(async (req, res, next) => {
    //const{title,description,image,price,location,country} = req.body;
    let listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect(`/listings`);
}));

router.get('/:id/edit', ValidateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render('listing/edit.ejs', { listing });
}));

router.put('/:id', ValidateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings`);
}));

router.delete('/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

module.exports = router;
