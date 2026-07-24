const mongoose = require('mongoose');
const Review = require('./reviews');


const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image: {
        url: String,
        filename: String
    },
    price:{
        type:Number,
    },
    location:{
        type:String,
        required:true
    },
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    country:{
        type:String,
        required:true
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Review'
    },],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    category:{
        type:String,
        enum: ["Trending",
            "Rooms",
            "Beach",
            "Amazing Pools",
            "Cabins",
            "Mountains",
            "Arctic",
            "Camping",
            "City",
            "Forest",
            "Lakefront",
            "Boats",
            "Luxury",
            "Family",
            "Pet Friendly",
            "Free WiFi",
            "Gym",
            "Spa",
            "Kitchen",
            "Parking"],
        required:true,
        defualt : "Trending"
    }
});

listingSchema.post('findOneAndDelete', async(listing)=>{
    if(listing.reviews.length){
        const res = await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})
let listing = mongoose.model('listing', listingSchema);
module.exports = listing;