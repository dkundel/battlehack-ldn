/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Query = require('../api/query/query.model');

Thing.find({}).remove(function() {
  Thing.create({
    name : 'Development Tools',
    info : 'Integration with popular tools such as Bower, Grunt, Karma, Mocha, JSHint, Node Inspector, Livereload, Protractor, Jade, Stylus, Sass, CoffeeScript, and Less.'
  }, {
    name : 'Server and Client integration',
    info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
  }, {
    name : 'Smart Build System',
    info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
    name : 'Modular Structure',
    info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    name : 'Optimized Build',
    info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    name : 'Deployment Ready',
    info : 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
  });
});

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    name: 'Test User',
    number: process.env.NAOMI_PHONE,
    email: 'test@test.com',
    password: 'test'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    number: process.env.NAOMI_PHONE,
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});

Query.find({}).remove(function () {
  Query.create({
    query: 'w',
    url: 'http://en.wikipedia.org/w/index.php?search=%q',
    selector: '#mw-content-text p:nth-of-type(1)',
    alternativeSelector: '.mw-search-result-heading>a', // selects href.
    user: 'default'
  }, {
    query: 'y',
    url: 'http://www.yelp.com/search?find_desc=%q',
    selector: '.search-results-content li:nth-of-type(1)',
    user: 'default'
  }, {
    query: 'a',
    url: 'http://www.amazon.co.uk/s/?field-keywords=%q',
    selector: '',
    user: ''
  });
})
