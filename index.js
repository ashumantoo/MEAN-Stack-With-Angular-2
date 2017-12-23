const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./config/database');
const authentication = require('./routes/authentication')(router);

mongoose.Promise = global.Promise;
mongoose.connect(config.uri, (err) => {
  if (err) {
    console.log('Could not connect to the database ', err);
  } else {
    console.log('Connected to the database ' + config.db);
  }
});

app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/client/dist/'));
app.use('/authentication', authentication);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/dist/index.html'));
});

app.listen('8000', () => {
  console.log('Listening on port 8000');
});
