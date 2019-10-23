const { Schema} = require("mongoose")
const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")

var User = new Schema({
   firstName:{
       type: String,
       required: true
   },
   lastName: {
       type:String,
       required: true
   },
   email:{
       type: String,
       required: true
   },
   role: {
       type: String,
       default: "user"
   }

})

User.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", User)