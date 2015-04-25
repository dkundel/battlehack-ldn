/**
 * Phantom parsing
 */

'use strict';

var phantom = require('phantom');

function wikipedia_check(query) {

  console.log("here!!");
}

// Get list of things
exports.parse = function(text, query, callback) {
	query.full_url = query.url.replace('%q', text.replace(" ", "_"));
	console.log("QUERY: " + JSON.stringify(query));
	phantom.create(function (ph) {
	  ph.createPage(function (page) {
	    page.open(query.full_url, function (status) {
	      console.log(query.selector);
	      page.evaluate(function (query) {
	      	console.log("INSIDE" + query.selector);
		  	return $(query.selector).text()
	      }, function (result) {
	      	result = result.replace(/(\n| )*/gm," ");
	        console.log('RESULT1:\n ' + result);
	        // FIND FIRST WIKIPEDIA RESULT
	        if ( query.query="w" && result.indexOf("does not exist") > -1) {
	        	console.log("query wrong");
 	        	page.open(query.full_url, function(status) {
	        		console.log("NO " + query.full_url);
	        		page.evaluate(function (query) {
	        			return document.querySelector(query.alternativeSelector).href;
	        		}, function (result) {
	        			console.log("RESULT2: " + JSON.stringify(result));
	        			page.open(result, function(status) {
	        				console.log("FIXED");
	        				page.evaluate(function (query) {
	        					// str.replace(/blue/g, "red");
						      	return $(query.selector).text();
	        				}, function (next_result) {
	        					console.log('RESULT:\n ' + JSON.stringify(next_result));
						        ph.exit();
 						        callback(next_result);
	        				}, query);
	        			});
	        		}, query);
	        	});
	        } else {
		        ph.exit();
		        callback(result);
	        }
	      }, query);
	    });
	  });
	});

}
