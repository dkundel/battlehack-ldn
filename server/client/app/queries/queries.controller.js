'use strict';

angular.module('serverApp')
  .controller('QueriesCtrl', function ($scope, $http, socket) {
    $scope.message = 'Hello';

    $scope.queries = [];

    $http.get('/api/queries').success(function(queries) {
      $scope.queries = queries;
      socket.syncUpdates('query', $scope.queries);
    });

    $scope.addQuery = function () {
      var query = {
        query: $scope.querySymbol,
        url: $scope.url,
        selector: $scope.selector
      };

      $http.post('/api/queries', { query: query });
    }

    $scope.deleteQuery = function (query) {
      $http.delete('/api/queries/' + query._id);
    }

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('query');
    });
  });
