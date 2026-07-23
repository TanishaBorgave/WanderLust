const Listing = require('../models/listing')
const axios = require("axios");

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
    const query = `${listing.location}, ${listing.country}`;

    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: query,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "Wanderlust-App"
            }
        }
    );

    if (response.data.length > 0) {
        listing.geometry = {
            type: "Point",
            coordinates: [
                parseFloat(response.data[0].lon), // longitude
                parseFloat(response.data[0].lat)  // latitude
            ]
        };
    } else {
        req.flash("error", "Location not found.");
        return res.redirect("/listings/new");
    }
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
    let url = listing.image.url;
    url = url.replace("/uploads/", "/uploads/w_300/");
    res.render('listing/edit.ejs', { listing , url });
}

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    let listing = await Listing.findById(id);

    // Update basic fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    // Geocode the updated location
    const query = `${listing.location}, ${listing.country}`;

    const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
            params: {
                q: query,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "Wanderlust-App"
            }
        }
    );

    if (response.data.length > 0) {
        listing.geometry = {
            type: "Point",
            coordinates: [
                parseFloat(response.data[0].lon), // longitude
                parseFloat(response.data[0].lat)  // latitude
            ]
        };
    }

    // Update image if a new one is uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect('/listings');
}