'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var QuerySchema = new Schema({
  query: String,
  url: String,
  selector: String,
  spaceCharacter: String,
  alternativeSelector: String,
  user: String
});

module.exports = mongoose.model('Query', QuerySchema);
