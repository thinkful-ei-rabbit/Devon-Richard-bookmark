require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { v4: uuidv4 } = require('uuid');

const bookmarkData = require('./bookmarkData');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(helmet());

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

app.get('/bookmark', (req, res) => {
  res.send(bookmarkData);
});

app.get('/bookmark/:id', (req, res) => {
  const { id } = req.params;
  const foundBookmark = bookmarkData.find((bookmark) => {
    return bookmark.id == id;
  });

  if (!foundBookmark) {
    return res.status(404).json({ error: 'Bookmark ID not found' });
  }

  res.send(foundBookmark);
});

app.post('/bookmark', (req, res) => {
  const newbookMark = req.body;

  const required = ['title', 'url', 'rating'];
  for (let key of required) {
    if (!req.body[key]) {
      return res.status(400).send(`Missing ${key} in request`);
    }
  }

  if (!req.body.url.startsWith('http')) {
    return res.status(400).send('URL must include "http"');
  }

  if (isNaN(req.body.rating)) {
    return res.status(400).send('Rating must be a numeric value');
  }

  newbookMark.id = uuidv4();
  bookmarkData.push(newbookMark);
  res
    .status(201)
    .location(`http://localhost:8000/bookmark/${newbookMark.id}`)
    .json(newbookMark);
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'info.log' })],
});

if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

module.exports = app;
