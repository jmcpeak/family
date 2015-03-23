'use strict';

angular.module('jmList', ['ngMaterial', 'jmUser', 'jmInput'])

    .directive("jmList", function () {
        return {
            scope: true,
            templateUrl: 'list/list.tpl.html',
            controller: 'jmListController'
        };
    })

    .controller("jmListController", function ($scope, jmDB) {
        $scope.users = [];
        $scope.count = '';
        $scope.lastUpdate = new Date();
        $scope.name = 'McPeak';
        $scope.height = 'auto';
        $scope.showDelete = false;

        var findUser = function (id) {
            for (var i in $scope.users) {
                if ($scope.users[i].id === id) {
                    return $scope.users[i];
                }
            }
        };

        $scope.$root.$on('userRemoved', function () {
            $scope.update(($scope.users.length >= 1) ? $scope.users[0] : undefined);
        });

        $scope.selectUser = function (user) {
            $scope.$root.$emit('selectUser', user);
        };

        $scope.$root.$on('refresh', function (event, id) {
            $scope.refresh(id);
        });

        $scope.refresh = function (id) {
            jmDB.queryAll().then(function (data) {
                $scope.$root.$emit('showListWait', false);
                $scope.count = data.length;
                $scope.users = data;

                if (id) {
                    $scope.update(findUser(id));
                }
            }, function (reason) {
                window.alert('Failed: ' + reason);
            });
        };

        $scope.refresh();
    })

    .directive("jmToolbar", function () {
        return {
            scope: true,
            templateUrl: 'list/toolbar.tpl.html',
            controller: 'jmToolbarController'
        };
    })

    .controller("jmToolbarController", function ($scope, $mdSidenav) {

        $scope.menus = [
            {link: 'https://github.com/jmcpeak/family/issues', label: 'Log an Issue'},
            {link: 'https://github.com/jmcpeak/family', label: 'See the code'},
            {link: 'https://travis-ci.org/jmcpeak/family', label: 'View Builds'}
        ];

        $scope.open = function () {
            $mdSidenav('left').open();
        };

        $scope.close = function () {
            $mdSidenav('left').close();
            // unselect button
        };
    });
