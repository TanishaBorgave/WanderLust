const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate=require('ejs-mate');
const ExpressError = require('./utils/ExpressError');

const listingRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/review.js');

app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);

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