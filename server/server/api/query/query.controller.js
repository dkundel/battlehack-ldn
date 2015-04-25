'use strict';

var _ = require('lodash');
var Query = require('./query.model');
var SmsController = require('../sms/sms.controller');

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

function handleError(res, err) {
  return res.send(500, err);
}
