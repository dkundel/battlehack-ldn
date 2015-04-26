'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var QuerySchema = new Schema({
  query: String,
  url: String,
  selector: String
});

module.exports = mongoose.model('Query', QuerySchema);
