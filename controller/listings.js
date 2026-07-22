const Listing = require('../models/listing')


module.exports.index = async (req, res) => {
    const listings = await Listing.find({})
    res.render('listing/listings.ejs', { listings })
}

module.exports.renderNewForm = (req, res) => {
    res.render('listing/new.ejs');
}

module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('owner');
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect('/listings');
    }
    console.log(listing);
    res.render('listing/show.ejs', { listing });
}

module.exports.createListing = async (req, res, next) => {
    //const{title,description,image,price,location,country} = req.body;
    let url = req.file.path;
    let filename = req.file.filename;
    req.body.listing.image = { url, filename };
    let listing = new Listing(req.body.listing); 
    const user = req.user;
    listing.owner = user._id;
    listing.image = { url, filename };
    await listing.save();
    req.flash("success", "Successfully made a new listing!");
    res.redirect(`/listings`);
}

module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect('/listings');
    }
    res.render('listing/edit.ejs', { listing });
}

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings`);
}

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect('/listings');
}