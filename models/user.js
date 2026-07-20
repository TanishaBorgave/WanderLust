const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose").default;


const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
    },
    //no need to add username and password fields because passport-local-mongoose will add them automatically
});

UserSchema.plugin(passportLocalMongoose); //adds username and password fields to the schema

module.exports = mongoose.model('User', UserSchema);