'use strict';

var _ = require('lodash');
var Payee = require('./payee.model');

var braintree = require('braintree');

var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   process.env.BRAINTREE_MERCHANT_ID,
    publicKey:    process.env.BRAINTREE_PUBLIC_KEY,
    privateKey:   process.env.BRAINTREE_PRIVATE_KEY
});

// Get list of payees
exports.index = function(req, res) {
  Payee.find({
    user: req.user._id
  }, function (err, payees) {
    if(err) { return handleError(res, err); }
    return res.json(200, payees);
  });
};

// Get a single payee
exports.show = function(req, res) {
  Payee.findById(req.params.id, function (err, payee) {
    if(err) { return handleError(res, err); }
    if(!payee) { return res.send(404); }
    return res.json(payee);
  });
};

// Creates a new payee in the DB.
exports.create = function(req, res) {
  var merchant = req.body.merchant;
  var nonce = req.body.nonce;
  var id = req.body.id;
  var payeeId = req.user._id + '_' + id;

  merchant.id = payeeId;
  merchant.funding.destination = braintree.MerchantAccount.FundingDestination.Bank;
  merchant.masterMerchantAccountId = process.env.BRAINTREE_MERCHANT_ACCOUNT_ID;
  merchant.tos_accepted = true;

  gateway.merchantAccount.create(merchant, function (err, result) {
    if (err) { return handleError(res, err); }

    console.log(result);

    var payee = {
      name: payeeId,
      shortName: id,
      nonce: nonce,
      merchant: merchant,
      user: req.user._id
    };

    Payee.create(payee, function (err, payee) {
      if (err) { return handleError(res, err); }
      return res.json(201, payee);
    });
  });
};

exports.pay = function (name, user, amount, callback) {
  var payeeId = user._id + '_' + name;

  Payee.findOne({
    name: payeeId
  }, function (err, payee) {
    if (err) {
      return callback('Failed to query database.', true);
    }

    if (!payee) {
      return callback('Could not find payee, please create the payee online.', true);
    }

    gateway.transaction.sale({
      merchantAccountId: payee.name,
      amount: amount,
      paymentMethodNonce: payee.nonce,
      serviceFeeAmount: '0.00'
    }, function (err, result) {
      if (err) {
        return callback('Failed to transfer money', true);
      }

      return callback('Successfully transfered the money', false);
    });
  });
}

// Updates an existing payee in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Payee.findById(req.params.id, function (err, payee) {
    if (err) { return handleError(res, err); }
    if(!payee) { return res.send(404); }
    var updated = _.merge(payee, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, payee);
    });
  });
};

// Deletes a payee from the DB.
exports.destroy = function(req, res) {
  Payee.findById(req.params.id, function (err, payee) {
    if(err) { return handleError(res, err); }
    if(!payee) { return res.send(404); }
    payee.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

exports.clienttoken = function (req, res) {
  gateway.clientToken.generate({}, function (err, response) {
    var clientToken = response.clientToken

    return res.json(200, {
      token: clientToken
    });
  });
}

function handleError(res, err) {
  return res.send(500, err);
}
