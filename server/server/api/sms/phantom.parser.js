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
	console.log("QUERY: " + JSON.stringify(query));
	phantom.create(function (ph) {
	  ph.createPage(function (page) {
	    page.open(query.url, function (status) {
	      console.log(query.selector);
	      page.evaluate(function (query) {
	      	console.log("INSIDE" + query.selector);
		  	return $(query.selector).text()
	      }, function (result) {
	        console.log('RESULT1:\n ' + JSON.stringify(result));
	        // FIND FIRST WIKIPEDIA RESULT
	        if (result.indexOf("does not exist") > -1) {
	        	console.log("query wrong");
	        	var search_url = query.selector + text.replace(' ', '+');
 	        	page.open(search_url, function(status) {
	        		console.log("NO");
	        		page.evaluate(function () {
	        			return document.querySelector('.mw-search-result-heading>a').href;
	        		}, function (result) {
	        			console.log("SEARCH URL: " + search_url);
	        			console.log("RESULT2: " + JSON.stringify(result));
	        			page.open(result, function(status) {
	        				console.log("FIXED");
	        				page.evaluate(function () {
						      	return document.querySelector('#mw-content-text p:nth-of-type(1)').innerText;
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
