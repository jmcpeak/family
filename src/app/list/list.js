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
        $scope.name = 'McPeak';
        $scope.height = 'auto';
        $scope.showDelete = false;
        $scope.queryAllInProgress = false;

        var findUser = function (id) {
            for (var i in $scope.users) {
                if ($scope.users[i].id === id) {
                    return $scope.users[i];
                }
            }
        };

        $scope.selectUser = function (user) {
            $rootScope.$emit('selectUser', user);
        };

        $scope.refresh = function (id) {
            $scope.queryAllInProgress = true;
            jmDB.queryAll().then(function (data) {
                $timeout(function () {

                    $scope.queryAllInProgress = false;
                    $scope.count = data.length;
                    $scope.users = data;

                    if (id) {
                        $scope.update(findUser(id));
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

        $rootScope.$on('refresh', function (event, id) {
            $scope.refresh(id);
        });

        $rootScope.$on('userRemoved', function () {
            $scope.update($scope.users.length >= 1 ? $scope.users[0] : undefined);
        });

        $scope.refresh();
        $scope.getLastUpdateDate();
    });