/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Payee = require('./payee.model');

exports.register = function(socket) {
  Payee.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Payee.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('payee:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('payee:remove', doc);
}