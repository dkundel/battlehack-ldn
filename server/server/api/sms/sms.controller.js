/**
 * POST    /sms/reply     ->  handle
 */

'use strict';

var _ = require('lodash');
var Query = require('../query/query.model');
var User = require('../user/user.model');
var PhantomParser = require('./phantom.parser');
var twilio = require('twilio');

// Get list of things
exports.handle = function(req, res, next) {
  console.log(req.body);
  var fromNumber = req.body.From || '';
  var textBody = req.body.Body || '';

  User.findOne({
    number: fromNumber
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    // if (!user) {
      var user = {number: fromNumber};
      // _reply('Please sign up to use our awesome service!', user);
      // return res.json(200);
    // }

    _parse(textBody, user);

    res.json(200);
  });
};

function _parse(text, user) {
  // parse the text content and find the necessary queries based on user
  // and call below text
  console.log("TEXT: " + text);

  var query = {
    query: text,
    url: "http://en.wikipedia.org/wiki/" + text.replace(' ', '_'),
    selector: '#mw-content-text p:nth-of-type(1)',
  };

  // wikipedia_check(query);

  var query2 = {
    query: "Minion_(film)",
    url: "http://en.wikipedia.org/wiki/Minions_(film)",
    selector: '#mw-content-text p:nth-of-type(1)',
    // TODO: Implement to ask something like 'Do you want to know more about next h2'
  };

  PhantomParser.parse(text, query, function (replyText) {
    console.log(text);
    _reply(replyText, user);
  });
}

function _reply(text, user) {
  var client = twilio();
  client.sendMessage({
      to: user.number,
      from: process.env.TWILIO_NUMBER,
      body: text
  }, function(error, message) {
      if (!error) {
          console.log('Success! The SID for this SMS message is:');
          console.log(message.sid);
          console.log('Message sent on:');
          console.log(message.dateCreated);
      } else {
          console.log('Oops! There was an error.');
          console.log(error);
      }
  });
}


function handleError(res, err) {
  return res.send(500, err);
}
