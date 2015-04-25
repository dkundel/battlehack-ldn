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
	  	console.log('bla');
	    page.open(query.url, function (status) {
	      console.log("hello ", status);
	      console.log(query.selector);
	      page.evaluate(function () { 				
	      	return document.querySelector('#mw-content-text p:nth-of-type(1)').innerText; 
	      	// jquery $('#mw-content-text p:nth-of-type(1)').text();
	      }, function (result) {
	        console.log('RESULT:\n ' + JSON.stringify(result));
	        // FIND FIRST WIKIPEDIA RESULT
	        if (result === "Other reasons this message may be displayed:") {
	        	console.log("query wrong");
	        	var search_url = "http://en.wikipedia.org/w/index.php?search=" + text.replace(' ', '+');
 	        	page.open(search_url, function(status) {
	        		console.log("NO");
	        		page.evaluate(function () {
	        			return document.querySelector('.mw-search-result-heading>a').href;
	        		}, function (result) {
	        			console.log("SEARCH URL: " + search_url);
	        			console.log("RESULT: " + JSON.stringify(result));
	        			page.open(result, function(status) {
	        				console.log("FIXED");
	        				page.evaluate(function () {
						      	return document.querySelector('#mw-content-text p:nth-of-type(1)').innerText; 
	        				}, function (result) {
	        					console.log('RESULT:\n ' + JSON.stringify(result));
						        ph.exit();
						        callback(result);	        	
	        				});
	        			});
	        		});
	        	});
	        } else {
		        ph.exit();
		        callback(result);	        	
	        }
	      });
	    });
	  });
	});

}
