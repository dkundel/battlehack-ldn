'use strict';

describe('Controller: QueriesCtrl', function () {

  // load the controller's module
  beforeEach(module('serverApp'));

  var QueriesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    QueriesCtrl = $controller('QueriesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
