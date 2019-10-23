const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const auth = require("./authenticate/index")
var userRouter = require("./routes/userRouter")
const mongoose = require("mongoose")
const passport = require("passport")
// var expressLayouts = require('express-ejs-layouts');
 

require('dotenv').config()

const movieRoutes = require("./services/movies")
const reviewRoutes = require("./services/reviews")
// const reviewRoutes = require("./services/reviews")

const server = express()
// server.use(expressLayouts);
// server.set('view engine', 'ejs');
server.use(cors())
server.use(bodyParser.json())
server.use(express.json());
server.use(passport.initialize())

server.use("/users", userRouter)
server.use("/movies", movieRoutes, reviewRoutes)

server.get("/authenticate", auth.verifyUser, auth.adminOnly, (req, res) => {
  res.send(req.user)
})

mongoose.connect("mongodb://localhost:27017", {
  useNewUrlParser: true
}).then(server.listen(3000, () => {
  console.log("Server running on port 3000");
})).catch(err => console.log(err))

// server.listen(3000, () => {
//   console.log("Server running on port 3000")
// })
