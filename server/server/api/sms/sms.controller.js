/**
 * POST    /sms/reply     ->  handle
 */

'use strict';

var _ = require('lodash');
var Query = require('./query.model');
var User = require('../user/user.model');
var PhantomParser = require('./phantom.parser');

// Get list of things
exports.handle = function(req, res) {
  console.log(req.body);
  var fromNumber = req.body.From || '';
  var textBody = req.body.Body || '';

  _parse('foobar', {});

  res.send(200,'');
};


function _parse(text, user) {
  // parse the text content and find the necessary queries based on user
  // and call below text
  var query = {};
  PhantomParser.parse(text, query, function (replyText) {
    _reply(replyText, user);
  });
}

function _reply(text, User) {
  // sends the 'text' to the respective user using twilio
}


function handleError(res, err) {
  return res.send(500, err);
}
