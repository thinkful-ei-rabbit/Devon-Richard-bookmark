const express = require('express');
const bookmarkData = require('../bookmarkData');
const logger = require('../logger');
const { v4: uuidv4 } = require('uuid');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route('/')
  .get((req, res) => {
    res.send(bookmarkData);
  })
  .post(bodyParser, (req, res) => {
    const newbookMark = req.body;

    const required = ['title', 'url', 'rating'];
    for (let key of required) {
      if (!req.body[key]) {
        return res.status(400).send(`Missing ${key} in request`);
      }
    }

    if (!req.body.url.startsWith('http')) {
      logger.error('Url does not begin with http');
      return res.status(400).send('URL must include "http"');
    }

    if (isNaN(req.body.rating)) {
      logger.error('Rating not found');
      return res.status(400).send('Rating must be a numeric value');
    }

    newbookMark.id = uuidv4();
    bookmarkData.push(newbookMark);
    res
      .status(201)
      .location(`http://localhost:8000/bookmark/${newbookMark.id}`)
      .json(newbookMark);
  });

bookmarkRouter
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    const foundBookmark = bookmarkData.find((bookmark) => {
      return bookmark.id == id;
    });

    if (!foundBookmark) {
      return res.status(404).json({ error: 'Bookmark ID not found' });
    }

    res.send(foundBookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const index = bookmarkData.findIndex((bookmark) => bookmark.id == id);
    if (index === -1) {
      logger.error(`Bookmark id: ${id} not Found`);
      return res.status(404).send('Bookmark not found');
    }
    bookmarkData.splice(index, 1);
    res.send(`Bookmark ${id} deleted`);
  });

module.exports = bookmarkRouter;
