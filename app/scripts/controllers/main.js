'use strict';

/**
 * @ngdoc function
 * @name familyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the familyApp
 */
angular.module('familyApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
