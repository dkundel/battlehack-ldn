'use strict';

angular.module('serverApp')
  .controller('PayeeCtrl', function ($scope, $http, socket) {
    $http.get('/api/payees/clienttoken').success(function (result) {
      braintree.setup(result.token, 'dropin', {
        container: 'dropin',
        onPaymentMethodReceived: function (obj) {
          console.log(obj.nonce);
          var request = {
            merchant: $scope.merchInfo,
            nonce: obj.nonce,
            id: $scope.payeeId
          }
          $http.post('/api/payees', request).success(function (result) {
            console.log(result);
            $scope.newPayeeOpen = false;
          });
        }
      })
    });

    $scope.defaultInfo = {
      individual: {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@14ladders.com",
        dateOfBirth: "1981-11-19",
        address: {
          streetAddress: "111 Main St",
          locality: "Chicago",
          region: "IL",
          postalCode: "60622"
        }
      },
      funding: {
        accountNumber: "1123581321",
        routingNumber: "071101307"
      }
    };

    $scope.merchInfo = JSON.parse(JSON.stringify($scope.defaultInfo));

    $scope.newPayeeOpen = false;

    $scope.payees = [];
    $http.get('/api/payees').success(function (result) {
      $scope.payees = result;
      socket.syncUpdates('payee', $scope.payees);
    });

    $scope.deletePayee = function (payee) {
      $http.delete('/api/payees/' + payee._id);
    }

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('payee');
    });
  });
