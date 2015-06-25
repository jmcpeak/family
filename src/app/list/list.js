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

    .controller('jmListController', function ($scope, $rootScope, $timeout, $localStorage, jmDB, jmConstant) {
        $scope.users = [];
        $scope.count = '';
        $scope.height = 'auto';
        $scope.showDelete = false;
        $scope.queryAllInProgress = false;

        var init = function () {
            jmDB.getItem('lastUpdateDate').then(function (data) {
                $timeout(function () {
                    $scope.lastUpdate = data.lastUpdated;
                });
            });

            $scope.refresh().then(function() {
                if ($localStorage.user) {
                    $timeout(function () {
                        angular.element(jmConstant.userIdHash + $localStorage.user.id).click()[0].scrollIntoView(false);
                    }, 100);
                }
            });
        };

        $rootScope.$on('refresh', function (event, user) {
            $scope.refresh(user);
        });

        $scope.refresh = function (user) {
            if (!user) {
                $scope.queryAllInProgress = true;
            }

            return jmDB.queryAll().then(function (data) {
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

        init();
    });