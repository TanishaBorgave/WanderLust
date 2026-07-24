const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing = require('../models/listing.js');
const axios = require('axios');

async function geocodeLocation(query) {
    try {
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
                },
                timeout: 10000
            }
        );

        if (response.data.length > 0) {
            return {
                type: "Point",
                coordinates: [
                    parseFloat(response.data[0].lon),
                    parseFloat(response.data[0].lat)
                ]
            };
        }
    } catch (err) {
        console.error("Seed geocoding failed for:", query, err.message);
    }

    return null;
}

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

    const seededListings = [];
    for (const obj of initdata.data) {
        const listing = {
            ...obj,
            owner: "6a5e371ad856c401fca9de46"
        };

        const geometry = await geocodeLocation(`${obj.location}, ${obj.country}`);
        if (geometry) {
            listing.geometry = geometry;
        }

        seededListings.push(listing);
    }

    await Listing.insertMany(seededListings);
    console.log('Database initialized with sample data');
}
initDb();