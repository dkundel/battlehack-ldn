/**
 * POST    /sms/reply     ->  handle
 */

'use strict';

var _ = require('lodash');
var Query = require('../query/query.model');
var User = require('../user/user.model');
var PhantomParser = require('./phantom.parser');

// Get list of things
exports.handle = function(req, res, next) {
  console.log(req.body);
  var fromNumber = req.body.From || '';
  var textBody = req.body.Body || '';

  User.findOne({
    number: fromNumber
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);

    _parse(textBody, user);

    res.json(200);
  });
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
