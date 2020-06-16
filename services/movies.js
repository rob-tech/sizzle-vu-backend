const express = require("express");
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

saveMovies = async (movies) => {
  await saveItems("movies.json", movies);
};

saveMiscMovies = async (movies) => {
  await saveItems("filtered.json", movies);
};

saveMoviesHP = async (movies) => {
  await saveItems("hpMovies.json", movies);
};

saveMoviesHobbit = async (movies) => {
  await saveItems("hobbitMovies.json", movies);
};

saveMoviesLOR = async (movies) => {
  await saveItems("lordOftheRings.json", movies);
};



router.get('/top-rated-movies', async (req, res) => {
  const response = await fetch("https://imdb8.p.rapidapi.com/title/get-top-rated-movies", {
    headers: { 'Access-Control-Allow-Origin': "*", "x-rapidapi-host": "imdb8.p.rapidapi.com", "x-rapidapi-key": "784a08652cmsha32051208a637acp1f594djsna6648f90d98e" }
  })
  let topMovieArr = [];
  let topTenArr = [];
  let movieId;
  let movieIdSplit;
  let topRatedMovieList = await response.json();
  topRatedMovieList = topRatedMovieList.slice(0, 10)

  topRatedMovieList.map(movie => (
    movieId = movie.id,
    movieIdSplit = movieId.split('/'),
    movieId = movieIdSplit[2],
    topMovieArr.push(movieId)
  ))

  for (let i = 0; i < topMovieArr.length; i++) {
    const resp = await fetch(`https://imdb8.p.rapidapi.com/title/get-details?tconst=${movieId}`, {
      headers: { 'Access-Control-Allow-Origin': "*", "x-rapidapi-host": "imdb8.p.rapidapi.com", "x-rapidapi-key": "784a08652cmsha32051208a637acp1f594djsna6648f90d98e" }
    })
    topTenArr.push(await resp.json())
}
  res.send(topTenArr)
})



router.get('/harrypotter', async (req, res) => {
  var response = await fetch('http://www.omdbapi.com/?apikey=448f4427&s=harry%20potter&type=movie')
  var hpMovies = await response.json();
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

//filteredSearch
router.get("/:movieName", async (req, res) => {
  var misc = []
  var movieName = req.params.movieName
  var response = await fetch('http://www.omdbapi.com/?apikey=448f4427&s=' + movieName)
  var movies = await response.json();
  delete movies.Search.Response
  delete movies.Search.totalResults
  movies = movies.Search
  movies.forEach(async movies => {
    misc.push(movies)
  })
  await saveMiscMovies(misc);
  res.send(misc);
});

//getMovieDetails
router.get("/details/:imdbID", async (req, res) => {
  var imdbID = req.params.imdbID
  var response = await fetch('http://www.omdbapi.com/?apikey=448f4427&i=' + imdbID)
  var movieDetails = await response.json();
  res.send(movieDetails);
});

//oneJSONFile
router.get("/", async (req, res) => {
  var allMovies = []
  var hobbitMovies = await getItems("hobbitMovies.json");
  var hpMovies = await getItems("hpMovies.json");
  var lorMovies = await getItems("lordOftheRings.json");
  hobbitMovies.forEach(async movies => {
    allMovies.push(movies)
  })
  hpMovies.forEach(async movies => {
    allMovies.push(movies)
  })
  lorMovies.forEach(async movies => {
    allMovies.push(movies)
  })

  await saveMovies(allMovies);
  res.send(allMovies)
});

//addMovie
router.post("/", async (req, res) => {
  var movies = await getMovies();
  var newMovie = req.body;
  movies.push(newMovie);
  await saveMovies(movies);
  res.send(newMovie);
});

//deleteMovie
router.delete("/:id", async (req, res) => {
  var movies = await getMovies();
  movies = movies.filter(movie => movie.imdbID != req.params.id)
  await saveMovies(movies)
  res.send(movies)
});


//add image
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

//update image and/or movie
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
