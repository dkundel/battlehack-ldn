'use strict';

angular.module('serverApp')
  .controller('MainCtrl', function ($scope, $http, socket, Auth) {
    $scope.awesomeThings = [];

    $scope.isLoggedIn = Auth.isLoggedIn;

    $scope.queries = [];

    if (Auth.isLoggedIn()) {
      $http.get('/api/queries').success(function(queries) {
        $scope.queries = queries;
      });
    }
  });
