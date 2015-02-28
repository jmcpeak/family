'use strict';

/**
 * @ngdoc function
 * @name familyApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the familyApp
 */
angular.module('familyApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
