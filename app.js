const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const review = require('./models/reviews');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate=require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { listingSchema , reviewSchema } = require('./schema.js');

app.use(methodOverride('_method'));
app.engine('ejs',ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function connectDB() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust')
}
connectDB()
.then(()=>{
    console.log('Connected to MongoDB');
})
.catch((err)=>{
    console.error('Error connecting to MongoDB:', err);
});

app.get('/',(req,res)=>{
    res.send('hi');;
});

const ValidateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el=> el.message).join(',');
        throw new ExpressError(errmsg, 400);
    }
    next();
};

const ValidateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errmsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errmsg, 400);
    }
    next();
};

app.get('/listings',wrapAsync(async(req,res)=>{
    const listings = await Listing.find({})
    res.render('listing/listings.ejs',{listings})
}));

app.get('/testlisting',wrapAsync(async (req,res)=>{
    let sampleLisiting = new Listing({
        title: "Sample Listing",
        description: "This is a sample listing for testing purposes.",
        image: "",
        price: 100,
        location: "Sample Location",
        country: "Sample Country"
    });
    await sampleLisiting.save();
    console.log('Sample listing saved to the database');
    res.send('Sample listing saved to the database');
}));

app.get('/listings/new', (req, res) => {
    res.render('listing/new.ejs');
})

app.get('/listings/:id',wrapAsync(async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    res.render('listing/show.ejs',{listing});
}));

app.post('/listings',ValidateListing,wrapAsync(async(req,res,next)=>{
    //const{title,description,image,price,location,country} = req.body;
    let listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect(`/listings`);
}));

app.get('/listings/:id/edit',ValidateListing,wrapAsync(async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listing/edit.ejs',{listing});
}));

app.put('/listings/:id',ValidateListing,wrapAsync(async(req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings`);
}));

app.delete('/listings/:id',wrapAsync(async(req,res)=>{
    const{id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

app.post('/listings/:id/reviews',ValidateReview,wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

app.delete('/listings/:id/reviews/:reviewId',wrapAsync(async(req,res)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;

    res.status(statusCode).render("error.ejs", {
        err: {
            statusCode,
            message
        }
    });
});

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});