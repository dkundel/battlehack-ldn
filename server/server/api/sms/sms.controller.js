/**
 * POST    /sms/reply     ->  handle
 */

'use strict';

var _ = require('lodash');
var Query = require('../query/query.model');
var User = require('../user/user.model');
var PhantomParser = require('./phantom.parser');
var PayeeController = require('../payee/payee.controller');
var Payee = require('../payee/payee.model');
var twilio = require('twilio');
var escapeHTML = require('underscore.string/escapeHTML');
var levenshtein = require('underscore.string/levenshtein');
var request = require('request');
var clean = require('underscore.string/clean');

// Get list of things
exports.handle = function(req, res, next) {
  console.log(req.body);
  var fromNumber = req.body.From || '';
  var textBody = req.body.Body || '';

  if (textBody.toLowerCase() === 'start') {
    _reply('Welcome to TextTheWeb. To test our service simply text something like:\nw:BattleHack\nFor more awesome queries sign up.', {number: fromNumber});
    return res.json(200);
  }

  User.findOne({
    number: fromNumber
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) {
      var user = {number: fromNumber};
      _parse(textBody, user, function (text, user) {
        var pleaseSignUp = '\n\nFor custom queries and payment please sign up.';
        if (text.length + 3 + pleaseSignUp.length > 320) {
          text = text.substr(0, 320 - (pleaseSignUp.length + 3));
          text += '...' + pleaseSignUp;
        }

        _reply(text, user, true);
      });
      return res.json(200);
    }

    if (textBody.indexOf('Pay:') === 0) {
      _payment(textBody, user, _reply);
      return res.json(200);
    }

    _parse(textBody, user, _reply);

    return res.json(200);
  });
};

function _payment(text, user, callback) {
  text = text.substr('Pay:'.length);
  var seperatorIndex = text.indexOf(':');
  if (seperatorIndex === -1) {
    if (text.trim().toLowerCase() === 'payees') {
      Payee.find({
        user: user._id
      }, function (err, payees) {
        if (err) return callback('Something went wrong finding the payees', user);
        if (!payees || payees.length === 0) return callback('No payees registered', user);

        var message = 'Your available Payees are:';
        for (var i = 0; i < payees.length; i++) {
          message += payees[i].shortName + ', ';
        }

        message = message.substr(0, message.length -2);

        return callback(message, user);
      });
    } else {
      return callback('Wrong formated paying message. Please write "Pay:PAYEESHORT:VALUE"', user);
    }

  } else {
    var payee = text.substr(0, seperatorIndex).trim();
    var amount = text.substr(seperatorIndex + 1).trim();

    PayeeController.pay(payee, user, amount, function (responseText, error) {
      callback(responseText, user);
    });
  }
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
  queryString = clean(queryString);

  Query.findOne({
    query : queryType
  }, function(err, result) {
    if(err) {
      callback("Internal error. Could unfortunatley not handle query. Please try again later.", user, true);
      return;
    }
    if(!result && queryType !== 't') {
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
      if(queryType === 't') {
        if(queryString === '') {
          callback("Plase send a translation request in the following format. Example:\n\n t : en de This a nice event.");
        } else {
          var queryArr = queryString.split(' ', 3);
          var to = '';
          var from = '';
          var text = '';
          var helpText = '';
          if(queryArr.length != 3) {
            to = 'en';
            helpText = 'Unfortunatley we could not understand your query completly. Nevertheless we tried:\n';
            text = queryArr[0] + " " + queryArr[1];
          } else {
            from = queryArr[0];
            to = queryArr[1];
            text = queryString.slice(from.length + to.length + 2);
          }
          _translate(text, user, from, to, helpText, callback);
        }
      } else {
        PhantomParser.parse(queryString, result, function (replyText) {
          console.log(text); // @todo remove later
          var maxSmsLength = 1600;
          replyText = replyText.substring(0, Math.min(maxSmsLength,replyText.length));
          callback(replyText, user);
        });
      }
    }
  });
}

function _translate(text, user, from, to, helpText, callback) {
  request.post(
    'https://datamarket.accesscontrol.windows.net/v2/OAuth2-13',
    { form: { client_id:  process.env.MICROSOFT_TRANSLATE_CLIENT_ID,
              client_secret: process.env.MICROSOFT_TRANSLATE_CLIENT_SECRET,
              scope: "http://api.microsofttranslator.com",
              grant_type: "client_credentials"} },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var jsonBody = JSON.parse(body);
        var access_token = jsonBody.access_token;
        var options = {
          url: encodeURI('http://api.microsofttranslator.com/v2/Http.svc/Translate?text=' + escapeHTML(text) + "&to=" + to + "&from=" + from),
          headers: {
            'Authorization': 'Bearer ' + access_token
          }
        };
        request(options, function get_callback(error, response, body) {
          if (!error && response.statusCode == 200) {
            var i = body.indexOf('>');
            if (i === -1) {
              console.log('Parsing error of translation request.');
              callback('Unfortunatley we were unable to translate your text.', user);
              return;
            }
            var answer = body.slice(i+1);
            i = answer.lastIndexOf('<');
            if (i === -1) {
              console.log('Parsing error of translation request.');
              callback('Unfortunatley we were unable to translate your text.', user);
              return;
            }
            answer = answer.slice(0, i);
            callback(helpText + answer, user);
          } else {
            callback("Unfortunatley we were unable to translate your text.", user);
          }
        });
      } else {
        callback("Unfortunatley we could not contact the translation service. Please try again later.", user);
      }
    });
}




exports.parse = _parse;

function _reply(text, user, truncated) {
  console.log(text);
  if (!truncated && text.length > 320) {
    text = text.substr(0, 317) + '...';
  }
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
