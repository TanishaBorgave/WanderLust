const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required(),
        image: Joi.string().allow("", null),
        category: Joi.string()
            .valid(
                "Trending",
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
                "Parking"
            ).required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});

