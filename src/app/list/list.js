'use strict';

angular.module('jmList', ['ngMaterial', 'jmUser', 'jmInput'])

    .directive("jmToolbar", function () {
        return {
            scope: true,
            templateUrl: 'list/toolbar.tpl.html'
        };
    })

    .directive("jmList", function () {
        return {
            scope: true,
            templateUrl: 'list/list.tpl.html',
            controller: function ($scope, $mdSidenav, jmDB) {
                $scope.users = [];
                $scope.count = '';
                $scope.lastUpdate = new Date();
                $scope.name = 'McPeak';
                $scope.height = 'auto';

                var findUser = function (id) {
                    for (var i in $scope.users) {
                        if ($scope.users[i].id === id) {
                            return $scope.users[i];
                        }
                    }
                };

                $scope.refesh = function (id) {
                    jmDB.queryAll().then(function (data) {
                        $scope.count = data.length;
                        $scope.users = data;

                        if (id) {
                            $scope.update(findUser(id));
                        }
                    }, function (reason) {
                        window.alert('Failed: ' + reason);
                    });
                };

                $scope.update = function (user) {
                    $scope.selectedUser = user;
                };

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

                $scope.refesh();
            }
        };
    });

