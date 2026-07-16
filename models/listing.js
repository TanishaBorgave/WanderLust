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

listingSchema.post('findOneAndDelete', async(listing)=>{
    if(listing.reviews.length){
        const res = await Review.deleteMany({_id:{$in:listing.reviews}})
    }
})
let listing = mongoose.model('listing', listingSchema);
module.exports = listing;