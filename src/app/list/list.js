'use strict';

angular.module('jmList', ['ngMaterial', 'jmUser', 'jmInput'])

    .directive("jmList", function () {
        return {
            templateUrl: 'list/list.tpl.html',
            controller: 'jmListController'
        };
    })

    .directive("jmToolbar", function () {
        return {
            replace: true,
            templateUrl: 'list/toolbar.tpl.html',
            controller: 'jmListController'
        };
    })

    .controller("jmListController", function ($scope, $rootScope, $timeout, jmDB) {
        $scope.lastUpdate;
        $scope.users = [];
        $scope.count = '';
        $scope.name = 'McPeak';
        $scope.height = 'auto';
        $scope.showDelete = false;
        $scope.showUserWaitIndicator = true;

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
            jmDB.queryAll().then(function (data) {
                $timeout(function () {

                    $scope.showUserWaitIndicator = false;
                    $scope.count = data.length;
                    $scope.users = data;

                    if (id) {
                        $scope.update(findUser(id));
                    }
                });
            }, function (reason) {
                $timeout(function () {
                    $scope.userWaitError = reason.message ? reason.message : 'Unknown Error';
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
    });
