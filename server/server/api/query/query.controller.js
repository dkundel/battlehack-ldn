'use strict';

var _ = require('lodash');
var Query = require('./query.model');
var SmsController = require('../sms/sms.controller');
var PayeeController = require('../payee/payee.controller');
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
  if (!req.query.From) {
    return res.json(400, {content: 'Bad Request'});
  }

  var from = '+' + req.query.From;

  if (text.indexOf('Pay:') === 0 && from) {
    User.findOne({
      number: from
    }, '-salt -hashedPassword', function (err, user) {
      if (err) return res.json(302, {content: 'Not authenticated'});
      if (!user) return res.json(404, {content: 'No user found'});

      text = text.substr('Pay:'.length);
      var sepeartorIndex = text.indexOf(':');
      if (sepeartorIndex === -1) {
        return res.json(400, {content: 'Wrong pay request'});
      }

      var payee = text.substr(0, sepeartorIndex);
      var amount = text.substr(sepeartorIndex + 1);

      PayeeController.pay(payee, user, amount, function (responseText, error) {
        var responseJson = {
          content: responseText
        }
        if (err) {
          return res.json(400, responseJson);
        }
        return res.json(200, responseJson);
      });
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
