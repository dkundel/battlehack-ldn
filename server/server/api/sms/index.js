'use strict';

var express = require('express');
var controller = require('./sms.controller');

var router = express.Router();

router.post('/query', controller.handle);

module.exports = router;
