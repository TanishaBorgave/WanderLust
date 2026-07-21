const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');

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

const initDb = async ()=>{
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=> ({ ...obj,
        owner:"6a5e371ad856c401fca9de46"
    }));
    await Listing.insertMany(initdata.data);
    console.log('Database initialized with sample data');
}
initDb();