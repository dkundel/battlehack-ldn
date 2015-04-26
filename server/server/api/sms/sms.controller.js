/**
 * POST    /sms/reply     ->  handle
 */

'use strict';

var _ = require('lodash');
var Query = require('../query/query.model');
var User = require('../user/user.model');
var PhantomParser = require('./phantom.parser');
var PayeeController = require('../payee/payee.controller');
var twilio = require('twilio');
var escapeHTML = require('underscore.string/escapeHTML');
var levenshtein = require('underscore.string/levenshtein');

// Get list of things
exports.handle = function(req, res, next) {
  console.log(req.body);
  var fromNumber = req.body.From || '';
  var textBody = req.body.Body || '';

  User.findOne({
    number: fromNumber
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) {
      var user = {number: fromNumber};
      _reply('Please sign up to use our awesome service!', user);
      return res.json(200);
    }

    if (textBody.indexOf('Pay:') === 0) {
      _payment(textBody, user, _reply);
      return res.json(200);
    }

    _parse(textBody, user, _reply);

    res.json(200);
  });
};

function _payment(text, user, callback) {
  text = text.substr('Pay:'.length);
  var seperatorIndex = text.indexOf(':');
  if (seperatorIndex === -1) {
    return callback('Wrong formated paying message. Please write "Pay:PAYEESHORT:VALUE"', user);
  }
  var payee = text.substr(0, seperatorIndex).trim();
  var amount = text.substr(seperatorIndex + 1).trim();

  PayeeController.pay(payee, user, amount, function (responseText, error) {
    callback(responseText, user);
  });
}

function _parse(text, user, callback) {
  // parse the text content and find the necessary queries based on user
  // and call below text
  var i = text.indexOf(':');
  if (i === -1) {
    callback('Unfortunatley your query is invalid. Try a query in the format queryType : queryString.', user);
    return;
  }
  var queryType = text.slice(0,i);
  var queryString = text.slice(i+1);
  queryType = queryType.replace(/\s+/g, '');
  queryType = escapeHTML(queryType);
  queryType = queryType.toLowerCase();
  queryString = queryString.trim();

  Query.findOne({
    query : queryType
  }, function(err, result) {
    if(err) {
      callback("Internal error. Could unfortunatley not handle query. Please try again later.", user, true);
      return;
    }
    if(!result) {
      var minDistance = Number.MAX_VALUE;
      var curDistance = Number.MAX_VALUE;
      var minDistanceQueryTypeStr = "";
      Query.find({
        $or: [
          {user: user._id},
          {user: 'default'}
        ]
      }, function (err, result){
        if(err) {
          callback("Internal error. Could unfortunatley not handle query. Please try again later.", user, true);
          return;
        }
        if(!result) {
          callback("Internal error. There are unfortunatley no queries defined yet. Please try again later.", user, true);
          return;
        }
        // iterate through queries and find smallest levensthein distance and ask user if they meant that
        for (var i = result.length - 1; i >= 0; i--) {
          curDistance = levenshtein(result[i].query, minDistanceQueryTypeStr);
          if(curDistance < minDistance) {
            minDistance = curDistance;
            minDistanceQueryTypeStr = result[i].query;
          }
        };
        callback("Could not find query type. Did you maybe mean to write:\n\n " + minDistanceQueryTypeStr + " : " + queryString, user, true);
        return;
      });
    } else {
      PhantomParser.parse(queryString, result, function (replyText) {
        console.log(text); // @todo remove later
        callback(replyText, user);
      });
    }
  });
}

exports.parse = _parse;

function _reply(text, user) {
  console.log(text);
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
