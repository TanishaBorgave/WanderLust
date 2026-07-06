const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate=require('ejs-mate');

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

app.get('/listings',async(req,res)=>{
    const listings = await Listing.find({})
    res.render('listing/listings.ejs',{listings})
});

app.get('/testlisting',async (req,res)=>{
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
});

app.get('/listings/new', (req, res) => {
    res.render('listing/new.ejs');
})

app.get('/listings/:id',async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listing/show.ejs',{listing});
});

app.post('/listings',async(req,res)=>{
    //const{title,description,image,price,location,country} = req.body;
    let listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect(`/listings`);
});

app.get('/listings/:id/edit',async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    res.render('listing/edit.ejs',{listing});
})

app.put('/listings/:id',async(req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings`);
});

app.delete('/listings/:id',async(req,res)=>{
    const{id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
})
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});