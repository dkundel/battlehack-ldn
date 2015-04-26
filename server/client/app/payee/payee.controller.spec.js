'use strict';

describe('Controller: PayeeCtrl', function () {

  // load the controller's module
  beforeEach(module('serverApp'));

  var PayeeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PayeeCtrl = $controller('PayeeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
