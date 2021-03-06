/**
 * Phantom parsing
 */

'use strict';

var clean = require('underscore.string/clean');
var phantom = require('phantom');
var ElizaBot = require('./elizabot').ElizaBot;

// page.open('http://www.phantomjs.org', function(status) {
//   if (status === "success") {
//     page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
//       if (page.injectJs('do.js')) {
//         var title = page.evaluate(function() {
//           // returnTitle is a function loaded from our do.js file - see below
//           return returnTitle();
//         });
//         console.log(title);
//         phantom.exit();
//       }
//     });
//   }
// });

// var eliza = new ElizaBot();
//          var initial = eliza.getInitial();
//          var reply = eliza.transform(inputstring);

//          if (eliza.quit) {
//              // last user input was a quit phrase
//          }

//          // method `transform()' returns a final phrase in case of a quit phrase
//          // but you can also get a final phrase with:
//          var final = eliza.getFinal();

//          // other methods: reset memory and internal state
//          eliza.reset();

//          // to set the internal memory size override property `memSize':
//          eliza.memSize = 100; // (default: 20)

//          // to reproduce the example conversation given by J. Weizenbaum
//          // initialize with the optional random-choice-disable flag
//          var originalEliza = new ElizaBot(true);

exports.bot = function (text, callback) {
	var eliza = new ElizaBot();
	var initial = eliza.getInitial();
	var reply = eliza.transform(text);
	if (eliza.quit) {

	}
	var final = eliza.getFinal();

	eliza.reset();
	eliza.memSize = 100;
	callback(reply);
}

// Get list of things
exports.parse = function(text, query, callback) {
    query.full_url = query.url.replace('%q', text.replace(" ", query.spaceCharacter));
    console.log("QUERY: " + JSON.stringify(query));
    console.log("FULL URL: " + query.full_url);
    phantom.create(function(ph) {
        ph.createPage(function(page) {
            page.open(query.full_url, function(status) {
                if (status === "success") {
                    page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
                            console.log(query.selector);
                            page.evaluate(function(query) {
                                console.log("INSIDE" + query.selector);
                                return $(query.selector).text()
                            }, function(result) {
                                result = clean(result);
                                console.log('RESULT1:\n ' + result);
                                // FIND FIRST WIKIPEDIA RESULT
                                switch (query.query) {
                            	    case "w":
                            	    	if (result.indexOf("does not exist") > -1) {
		                                    console.log("query wrong");
        		                            page.open(query.full_url, function(status) {
                		                        console.log("NO " + query.full_url);
                        		                page.evaluate(function(query) {
                                	            return document.querySelector(query.alternativeSelector).href;
                                    	    }, function(result) {
                                        	    console.log("RESULT2: " + JSON.stringify(result));
                                            	page.open(result, function(status) {
                                                	console.log("FIXED");
                                                	page.evaluate(function(query) {
                                                    	return $(query.selector).text();
                                                	}, function(next_result) {
                                                    	console.log('RESULT:\n ' + JSON.stringify(next_result));
                                                    	ph.exit();
                                                    callback(next_result);
                                                }, query);
                                            });
                                        	}, query);
                                    		});
                                		}
                                		break;
                                	case "y":
	                                    if (result.indexOf("Try a larger search area.") > -1) {
    	                                    result = "We did not understand your query. Please try again!";
        	                                ph.exit();
            	                            callback(result);
                	                    }
                	                    break;
                	                case "d":
                	                	if (result === "") {
                	                		result = "We did not understand your query. Please try again!";
	                	                    ph.exit();
                    	                	callback(result);
    	        	                	}
                	                	break;
                	                case "s":
                	                	if (result === "") {
                	                		result = "We did not understand your query. Please try again!";
	                	                    ph.exit();
                    	                	callback(result);
                	                	}
                	                	break;
                	                default:
                	                	if (result === "" || result.indexOf("There were no results matching the query" > -1)) {
                	                		result = "We did not understand your query. Please try again!";
	                	                    ph.exit();
                    	                	callback(result);
  	        	                	     }
    	        	                	   break;
                                }
                                ph.exit();
                                callback(result);
                            }, query);
                    });
                }
            });
        });
    });

}
