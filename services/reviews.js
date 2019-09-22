const express = require("express");
const fs = require("fs-extra");
const shortid = require("shortid");
const path = require("path");
const utils = require("./utils");
const cors = require('cors');
const router = express.Router();

getReviews = async () => {
    return await getItems("reviews.json");
  };
  
saveReviews = async (reviews) => {
    await saveItems("reviews.json", reviews);
  };

  router.get("/:imdbID/reviews", async (req, res) => {
    var reviews = await getReviews();
    res.send(reviews.filter(review => review.movieId == req.params.imdbID));
  });
  
  router.post("/:imdbID/reviews", async (req, res) => {
    var reviews = await getReviews();
    req.body.id = shortid.generate();
    req.body.createdDate = new Date();
    req.body.movieId = req.params.imdbID;
    reviews.push(req.body);
    await saveReviews(reviews);
    res.send(req.body);
  });
  
  router.delete("/reviews/:commentId", async (req, res) => {
    var reviews = await getReviews();
    await saveReviews(reviews.filter(review => review.id != req.params.id))
    res.send("ok");
  });

  module.exports = router