'use strict';

angular.module('jmUser', ['ngMaterial'])

    .directive("jmUser", function () {
        return {
            templateUrl: 'user/user.tpl.html',
            controller: function ($scope, $location, $timeout, $mdDialog, $mdToast, jmDB) {
                $scope.tabs = ['required', 'additional', 'spouse', 'dates and places', 'children / pets'];
                $scope.selectedIndex = 0;

                $scope.putItem = function () {
                    var promise = jmDB.putItem($scope.selectedUser);

                    var toast = function (msg, error) {
                        $scope.userForm.$setPristine();
                        var errorClass = (error) ? 'class="error"' : undefined;

                        $mdToast.show({
                            template: '<md-toast ' + errorClass + '><span flex><b>' + msg + '</b></span></md-toast>',
                            hideDelay: 2000,
                            position: 'top right'
                        });
                    };
                    promise.then(
                        function () {
                            toast('Saved');
                        },
                        function () {
                            toast('There was a problem saving...', true);
                        });
                };

                $scope.update = function (user) {
                    $scope.selectedUser = user;
                };

                $scope.add = function (event) {
                    $scope.addUser = true;
                    $mdDialog.show({
                        templateUrl: 'user/dialog.tpl.html',
                        targetEvent: event
                    });
                };

                $scope.next = function () {
                    $scope.selectedIndex = Math.min($scope.selectedIndex + 1, 2);
                };

                $scope.previous = function () {
                    $scope.selectedIndex = Math.max($scope.selectedIndex - 1, 0);
                };

                $scope.partial = function (index) {
                    switch (index) {
                        case 0:
                            $location.path('/required');
                            break;
                        case 1:
                            $location.path('/additional');
                            break;
                        case 2:
                            $location.path('/spouse');
                            break;
                        case 3:
                            $location.path('/datesAndPlaces');
                            break;
                        case 4:
                            $location.path('/children');
                            break;
                        default :
                            $location.path('/required');
                            break;
                    }
                };
            }
        };
    })

    .directive("jmAddButton", function () {
        return {
            templateUrl: 'user/button.tpl.html'
        };
    })

    .directive("jmAddButtonDesktop", function () {
        return {
            templateUrl: 'user/buttonDesktop.tpl.html'
        };
    })

    .directive("jmDialog", function () {
        return {
            templateUrl: 'user/dialog.tpl.html'
        };
    });