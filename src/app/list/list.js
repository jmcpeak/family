'use strict';

angular.module('jmList', ['ngMaterial', 'jmUser', 'jmViewEdit'])

    .directive("jmToolbar", function () {
        return {
            templateUrl: 'list/toolbar.tpl.html'
        };
    })

    .directive("jmList", function () {
        return {
            templateUrl: 'list/list.tpl.html',
            controller: function ($scope, $mdSidenav, jmDB) {
                var promise = jmDB.queryAll();
                $scope.users = [];
                $scope.count = '';
                $scope.lastUpdate = new Date();
                $scope.name = 'McPeak';
                $scope.height = 'auto';

                promise.then(function (data) {
                    $scope.count = data.length;
                    $scope.users = data;
                }, function (reason) {
                    window.alert('Failed: ' + reason);
                });

                $scope.open = function () {
                    $mdSidenav('left').open();
                };

                $scope.close = function () {
                    $mdSidenav('left').close();
                };

                $scope.showDelete = false;

                $scope.menus = [
                    {link: 'https://github.com/jmcpeak/family/issues', label: 'Log an Issue'},
                    {link: 'https://github.com/jmcpeak/family', label: 'See the code'},
                    {link: 'https://travis-ci.org/jmcpeak/family', label: 'View Builds'}
                ];
            }
        };
    });

