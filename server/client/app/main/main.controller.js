'use strict';

angular.module('serverApp')
  .controller('MainCtrl', function ($scope, $http, socket, Auth) {
    $scope.awesomeThings = [];

    $scope.isLoggedIn = Auth.isLoggedIn;

    $scope.queries = [];
    $scope.payees = [];

    if (Auth.isLoggedIn()) {
      $http.get('/api/queries').success(function(queries) {
        $scope.queries = queries;
      });

      $http.get('/api/payees').success(function(payees) {
        $scope.payees = payees;
      });
    }
  });
