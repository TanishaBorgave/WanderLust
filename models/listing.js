const mongoose = require('mongoose');


const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image: {
        filename: {
            type: String,
            default: "listingimage",
        },
        url: {
            type: String,
            default:
                "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
        },
    },
    price:{
        type:Number,
    },
    location:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Review'
    },],
});
let listing = mongoose.model('listing', listingSchema);
module.exports = listing;