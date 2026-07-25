if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate=require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;

const User = require('./models/user.js');

const listingRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/review.js');
const userRoutes = require('./routes/user.js');

app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const dbUrl = process.env.ATLAS_DB_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wanderlust';
const sessionSecret = process.env.SECRET || "dev-secret-change-me";
const sessionCookieName = "wanderlust.sid.v2";
const mongoOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
};

async function connectDB() {
    await mongoose.connect(dbUrl, mongoOptions);
}
connectDB()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });

let store;
try {
    store = MongoStore.create({
        mongoUrl: dbUrl,
        mongoOptions,
        collectionName: "sessions_v2",
        crypto: {
            secret: sessionSecret,
        },
        touchAfter: 24 * 3600,
    });

    store.on("error", function(e){
        console.log("Session Store Error", e);
    });
} catch (e) {
    console.error("Failed to initialize Mongo session store, falling back to memory store:", e.message);
}

const expressOptions = {
    name: sessionCookieName,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000, // 7 days in milliseconds
        maxAge: 7*24*60*60*1000, // 7 days in milliseconds,
        httpOnly: true
    },
};

if (store) {
    expressOptions.store = store;
}

app.use(session(expressOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

app.get("/demoUser", async(req,res)=>{
    const user = new User({
        email:"demo@example.com",
        username:"demouser"
    });
    let registeredUser = await User.register(user, "demopassword");
    res.send(registeredUser);
})
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});