'use strict';

describe('Controller: txnsCtrl', function () {

  // load the controller's module
  beforeEach(module('txnsApp'));

  var txnsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    txnsCtrl = $controller('txnsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
