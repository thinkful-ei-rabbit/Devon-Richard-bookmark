require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const validateBearerToken = require('./validateBearerToken');
const errorHandler = require('./errorHandler');
const bookmarkRouter = require('./bookmark-router/bookmark-router');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(helmet());

app.use(validateBearerToken);

app.use('/bookmark', bookmarkRouter);

app.use(errorHandler);

module.exports = app;
