const express = require("express");
const shortId = require("shortid");
const multer = require("multer");
// const { parse } = require("url")
const path = require("path");
const utils = require("./utils");
const fs = require("fs-extra");
const cors = require('cors');
const fetch = require('node-fetch');

const router = express.Router();


getMovies = async () => {

  return await getItems("movies.json");
};

saveMoviesHP = async (movies) => {
  // var movies = hobbitMovies.concat(hpmovies)
  await saveItems("hpMovies.json", movies);
};

saveMoviesHobbit = async (movies) => {
  // var movies = hobbitMovies.concat(hpmovies)
  await saveItems("hobbitMovies.json", movies);
};

saveMoviesLOR = async (movies) => {
  // var movies = hobbitMovies.concat(hpmovies)
  await saveItems("lordOftheRings.json", movies);
};

//   router.get("/", async (req, res) => {
//     var movies = await getMovies("");
//     await saveItems("movies.json", movies);
// });

  router.get('/', async (req, res) => {
    var response = await fetch('http://www.omdbapi.com/?apikey=448f4427&s=harry%20potter&type=movie')
    var hpMovies = await response.json();
    // hpmovies = JSON.parse(body)
    delete hpMovies.Search.Response
    delete hpMovies.Search.totalResults
    hpMovies = hpMovies.Search
    await saveMoviesHP(hpMovies)
    res.send(hpMovies)  
  });
    
    router.get('/hobbit', async (req, res) => {
    var response = await fetch('http://www.omdbapi.com/?apikey=448f4427&s=hobbit&type=movie')
    var hobbitMovies = await response.json();
    delete hobbitMovies.Search.Response
    delete hobbitMovies.Search.totalResults
    hobbitMovies = hobbitMovies.Search
    // res.status(200).send((hobbitMovies[0]).toString());        
    await saveMoviesHobbit(hobbitMovies)
    res.send(hobbitMovies) 
  });

  router.get('/lor', async (req, res) => {
    var response = await fetch('http://www.omdbapi.com/?apikey=448f4427&s=lord%20of%20the%20rings&type=movie')
    var lor = await response.json();
    delete lor.Search.Response
    delete lor.Search.totalResults
    lor = lor.Search
    // res.status(200).send((hobbitMovies[0]).toString());        
    await saveMoviesLOR(lor)
    res.send(lor) 
  }); 

router.post("/", async (req, res) => {
  var movies = await getMovies();
  var newMovie = req.body;
  newMovie.id = shortid.generate();
  movies.push(newMovie);
  await saveMovies(movies);
  res.send(newMovie);
});

router.delete("/:id", async (req, res) => {
  var movies = await getMovies();
  movies = movies.filter(movie => movie.imdbID != req.params.id)
  await saveMovies(movies)
  res.send(movies)
});

const multerInstance = multer({});

// router.get('/:name/download', (req, res, next)=> {    
//   const {name} = req.params
//       const path = join(studentsFolder, name)  
//       res.setHeader('Content-Disposition', `attachment; filename=myFile.png`)
//       fs.createReadStream(path).on('end', (data) => res.send(data)).on('error', err => next(err))  
//   })

router.post("/:id/upload", multerInstance.single("pic"), async (req, res) => {
  var fullUrl = req.protocol + "://" + req.get("host") + "/public/img/";
  req.params.id + "." + req.file.originalname.split(".").reverse()[0]

  var ext = path.extname(req.file.originalname);
  var movieId = req.params.id;
  var fileName = movieId + ext;
  await fs.writeFile("./public/img/" + fileName, req.file.buffer);

  var movies = await getMovies();
  var toUpdate = movies.find(movie => movie.imdbID == req.params.id);
  toUpdate.Poster = fullUrl + fileName;
  await saveMovies(movies);
  res.send(toUpdate);
});


router.put("/:id", multerInstance.single("pic"), async (req, res) => {

  if (req.file) {
    var fullUrl = req.protocol + "://" + req.get("host") + "/public/img/"
    req.params.id + "." + req.file.originalname.split(".").reverse()[0]
    var ext = path.extname(req.file.originalname)
    var fileName = req.params.id + ext;
    await fs.writeFile("./public/img/" + fileName, req.file.buffer)

    var movies = await getMovies();
    var oldMovie = movies.find(movie => movie.imdbID == req.params.id)
    var newMovie = JSON.parse(req.body.metadata)
    // delete newMovie.imdbID
    Object.assign(oldMovie, newMovie)
    await saveMovies(movies)
    res.send(oldMovie)
  }
  else {
    var movies = await getMovies();
    var oldMovie = movies.find(movie => movie.imdbID == req.params.id)
    var newMovie = req.body
    // delete newMovie.id
    Object.assign(oldMovie, newMovie)
    await saveMovies(movies)
    res.send(oldMovie)
  }
})

module.exports = router
