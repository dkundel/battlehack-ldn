'use strict';

var _ = require('lodash');
var Query = require('./query.model');
var SmsController = require('../sms/sms.controller');
var PayeeController = require('../payee/payee.controller');
var Payee = require('../payee/payee.model');
var PhantomParser = require('../sms/phantom.parser');
var User = require('../user/user.model');

// Get list of queries
exports.index = function(req, res) {
  Query.find({
    $or: [
      {user: req.user._id},
      {user: 'default'}
    ]
  }, function (err, queries) {
    if(err) { return handleError(res, err); }
    return res.json(200, queries);
  });
};

// Get a single query
exports.show = function(req, res) {
  Query.findById(req.params.id, function (err, query) {
    if(err) { return handleError(res, err); }
    if(!query) { return res.send(404); }
    return res.json(query);
  });
};

// Creates a new query in the DB.
exports.create = function(req, res) {
  var query = req.body.query;
  query.user = req.user._id;
  query.query = query.query.toLowerCase();

  Query.create(query, function(err, query) {
    if(err) { return handleError(res, err); }
    return res.json(201, query);
  });
};

// Updates an existing query in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Query.findById(req.params.id, function (err, query) {
    if (err) { return handleError(res, err); }
    if(!query) { return res.send(404); }
    var updated = _.merge(query, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, query);
    });
  });
};

// Deletes a query from the DB.
exports.destroy = function(req, res) {
  Query.findById(req.params.id, function (err, query) {
    if(err) { return handleError(res, err); }
    if(!query) { return res.send(404); }
    query.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.query = function (req, res) {
  var text = req.query.Body || '';
  var user = {_id: ''};
  var from = null;

  if (req.query.From) {
    from = '+' + req.query.From;
  }

  if (text.indexOf('Pay:') === 0 && from !== null) {
    User.findOne({
      number: from
    }, '-salt -hashedPassword', function (err, user) {
      if (err) return res.json(302, {content: 'Not authenticated'});
      if (!user) return res.json(404, {content: 'No user found'});

      text = text.substr('Pay:'.length);
      var sepeartorIndex = text.indexOf(':');
      if (sepeartorIndex === -1) {
        if (text.trim().toLowerCase() === 'payees') {
          Payee.find({
            user: user._id
          }, function (err, payees) {
            if (err) return res.json(500, {content: 'Something went wrong finding the payees'});
            if (!payees || payees.length === 0) return res.json(404, {content: 'No payees registered'});

            var message = '';
            for (var i = 0; i < payees.length; i++) {
              message += payees[i].shortName + ',';
            }

            message = message.substr(0, message.length -1);

            return res.json(200, {content: message});
          });
        } else {
          return res.json(400, {content: 'Wrong pay request'});
        }
      } else {
        var payee = text.substr(0, sepeartorIndex).trim();
        var amount = text.substr(sepeartorIndex + 1).trim();

        PayeeController.pay(payee, user, amount, function (responseText, error) {
          var responseJson = {
            content: responseText
          }
          if (err) {
            return res.json(400, responseJson);
          }
          return res.json(200, responseJson);
        });
      }
    });
  } else if (text.indexOf('Bot:') === 0) {
    var content = text.substr('Bot:'.length).trim();
    PhantomParser.bot(content, function (responseText) {
      return res.json(200, responseText);
    });
  } else {
    SmsController.parse(text, user, function (responseText, user, error) {
      var responseJson = {
        content: responseText
      };
      if (error) {
        return res.json(400, responseJson);
      }
      return res.json(200, responseJson);
    });
  }
}

function handleError(res, err) {
  return res.send(500, err);
}
