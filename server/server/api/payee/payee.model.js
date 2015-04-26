'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PayeeSchema = new Schema({
  name: String,
  shortName: String,
  nonce: String,
  user: String,
  merchant: Schema.Types.Mixed
});

module.exports = mongoose.model('Payee', PayeeSchema);
