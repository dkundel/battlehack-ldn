'use strict';

angular.module('serverApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('queries', {
        url: '/queries',
        templateUrl: 'app/queries/queries.html',
        controller: 'QueriesCtrl',
        authenticate: true
      });
  });
