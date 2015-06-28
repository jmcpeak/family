'use strict';

angular.module('jmList', ['ngMaterial', 'jmUser', 'jmInput'])

    .directive('jmList', function () {
        return {
            replace: true,
            templateUrl: 'list/list.tpl.html',
            controller: function ($scope, $timeout, $window, $localStorage, $mdMedia, jmDB, jmConstant) {
                $scope.users = [];
                $scope.count = '';
                $scope.height = 'auto';
                $scope.showDelete = false;
                $scope.queryAllInProgress = false;

                var init = function () {
                    jmDB.getItem('lastUpdateDate').then(function (data) {
                        $timeout(function () {
                            $scope.lastUpdate = data.lastUpdated;
                            $scope.lastUpdatedID = data.lastUpdatedID;
                        });
                    });

                    $scope.refresh($localStorage.user, true);
                };

                $scope.refresh = function (user, init) {
                    if (!init) {
                        $scope.queryAllInProgress = true;
                    }

                    return jmDB.queryAll().then(function (data) {
                        $timeout(function () {

                            $scope.count = data.length;
                            $scope.users = data;
                            if (user) {
                                $scope.selectUser(user);
                                $timeout(function () {
                                    angular.element(jmConstant.userIdHash + user.id).click()[0].scrollIntoView(false);
                                }, 200);
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

                $scope.openUrl = function (url) {
                    $window.open(url, '_blank');
                };

                $scope.email = function () {
                    jmDB.getEmailAddresses().then(function (addresses) {
                        var emailAddresses;
                        var sep = $mdMedia('lg') ? ';' : ',';
                        angular.forEach(addresses, function (address) {
                            emailAddresses = emailAddresses ? emailAddresses + sep + address.email : address.email;
                        });

                        window.location = 'mailto:' + emailAddresses + '?subject=McPeak%20Family';
                    });
                };

                $scope.export = function () {
                    jmDB.exportToCSV().then(function (entries) {
                        var link = document.createElement('a');
                        link.setAttribute('href', encodeURI('data:text/csv;charset=utf-8,' + entries));
                        link.setAttribute('download', 'McPeak Family.csv');
                        link.click();
                    });
                };

                init();
            }
        };
    })

    .directive('jmToolbar', function () {
        return {
            replace: true,
            templateUrl: 'list/toolbar.tpl.html'
        };
    });