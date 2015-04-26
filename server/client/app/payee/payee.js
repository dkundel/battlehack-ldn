'use strict';

angular.module('serverApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('payee', {
        url: '/payee',
        templateUrl: 'app/payee/payee.html',
        controller: 'PayeeCtrl'
      });
  });