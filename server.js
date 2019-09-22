const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")

const movieRoutes = require("./services/movies")
const reviewRoutes = require("./services/reviews")
// const reviewRoutes = require("./services/reviews")

const server = express()

// server.use("/public", express.static(__dirname + "/public"))

server.use(cors())
server.use(bodyParser.json())

server.use("/movies", movieRoutes, reviewRoutes)
// server.use("/movies/reviews", reviewRoutes)
// server.use("/reviews", movieRoutes)
// server.use("/reviews", reviewRoutes)


server.listen(3000, () => {
  console.log("Server running on port 3000")
})
