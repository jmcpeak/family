'use strict';

angular.module('jmList', ['ngMaterial', 'jmUser', 'jmInput'])

    .directive('jmList', function () {
        return {
            replace: true,
            templateUrl: 'list/list.tpl.html',
            controller: 'jmListController'
        };
    })

    .directive('jmToolbar', function () {
        return {
            replace: true,
            templateUrl: 'list/toolbar.tpl.html'
        };
    })

    .controller('jmListController', function ($scope, $rootScope, $timeout, jmDB) {
        $scope.users = [];
        $scope.count = '';
        $scope.height = 'auto';
        $scope.showDelete = false;
        $scope.queryAllInProgress = false;

        $rootScope.$on('refresh', function (event, user) {
            $scope.refresh(user);
        });

        $scope.refresh = function (user) {
            if (!user) {
                $scope.queryAllInProgress = true;
            }

            jmDB.queryAll().then(function (data) {
                $timeout(function () {

                    $scope.count = data.length;
                    $scope.users = data;
                    if (user) {
                        $scope.selectUser(user);
                    } else {
                        $scope.queryAllInProgress = false;
                    }
                });
            }, function (reason) {
                $timeout(function () {
                    $scope.queryAllInProgress = true;
                    $scope.queryAllError = reason.message ? reason.message : 'Unknown Error';
                });
            });
        };

        $scope.getLastUpdateDate = function () {
            $scope.queryAllInProgress = true;
            jmDB.getItem('lastUpdateDate').then(function (data) {
                $timeout(function () {
                    $scope.lastUpdate = data.lastUpdated;
                });
            });
        };

        $scope.refresh();
        $scope.getLastUpdateDate();
    });