require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const MOVIES = require('./movies.json');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');
  
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  
  next();
});

app.get('/movie', function handleGetMovie(req, res) {
  let result = MOVIES;

  if(req.query.genre) {
    result = result.filter(movie =>
      movie.genre.toLowerCase().includes(req.query.genre.toLowerCase()));
  }
  if(req.query.country) {
    result = result.filter(movie => 
      movie.country.toLowerCase().includes(req.query.country.toLowerCase()));
}
  if(req.query.avg_vote) {
    result = result.filter(movie =>
      Number(movie.avg_vote) >= Number(req.query.avg_vote));
  }

  res.json(result);
});

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;

app.listen(PORT);