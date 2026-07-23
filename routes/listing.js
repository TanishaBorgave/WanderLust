const express = require('express');
const router = express.Router({ mergeParams: true });
const { isloggedIn , isOwner } = require('../middleware.js');
const ListingController = require('../controller/listings');

const wrapAsync = require('../utils/wrapAsync');
const { listingSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressError');
const Listing = require('../models/listing');
const {storage} = require('../cloudConfig.js');

const multer = require('multer');
const upload = multer({ storage });

const ValidateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el=> el.message).join(',');
        throw new ExpressError(errmsg, 400);
    }
    next();
};

router
.route('/')
.get(wrapAsync(ListingController.index))
.post(isloggedIn, upload.single('listing[image]'), ValidateListing, wrapAsync(ListingController.createListing));

router.get('/new', isloggedIn, ListingController.renderNewForm);

router
.route('/:id')
.get(wrapAsync(ListingController.showListing))
.put(isloggedIn, isOwner,upload.single('listing[image]'), ValidateListing, wrapAsync(ListingController.updateListing))
.delete(isloggedIn, isOwner, wrapAsync(ListingController.deleteListing));


router.get('/:id/edit',isloggedIn, isOwner, wrapAsync(ListingController.editListing));

module.exports = router;
