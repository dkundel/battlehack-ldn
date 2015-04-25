/**
 * POST    /sms/reply     ->  handle
 */

'use strict';

var _ = require('lodash');
var Query = require('../query/query.model');
var User = require('../user/user.model');
var PhantomParser = require('./phantom.parser');
var twilio = require('twilio');
var slugify = require('underscore.string/escapeHTML');
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

    _parse(textBody, user, _reply);

    res.json(200);
  });
};

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
      callback("Internal error. Could unfortunatley not handle query. Please try again later.", user);
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
          callback("Internal error. Could unfortunatley not handle query. Please try again later.", user);
          return;
        }
        if(!result) {
          callback("Internal error. There are unfortunatley no queries defined yet. Please try again later.", user);
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
        callback("Could not find query type. Did you maybe mean to write: " + minDistanceQueryTypeStr + " : " + queryString, user);
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
