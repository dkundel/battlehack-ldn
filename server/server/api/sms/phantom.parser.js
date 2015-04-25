/**
 * Phantom parsing
 */

'use strict';

var phantom = require('phantom');

// Get list of things
exports.parse = function(text, query, callback) {
	console.log("QUERY: " + JSON.stringify(query));
	phantom.create(function (ph) {
	  ph.createPage(function (page) {
	  	console.log('bla');
	    page.open(query.url, function (status) {
	      console.log("hello ", status);
	      console.log(query.selector);
	      page.evaluate(function () { 				
	      	return document.querySelector('#mw-content-text p:nth-of-type(1)').innerText; 
	      }, function (result) {
	        console.log('RESULT:\n ' + JSON.stringify(result));
	        ph.exit();
	        callback('foo');
	      });
	    });
	  });
	});

}
