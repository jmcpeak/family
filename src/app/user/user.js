'use strict';

angular.module('jmUser', ['ngMaterial', 'jmPartials'])

    .controller('jmDialogController', function ($scope, $mdDialog, jmDB) {
        $scope.selectedUser = {id: jmDB.guid()};
        $scope.formName = 'addUser';

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.putItem = function () {
            $scope.$root.$emit('putItem');
        };
    })

    .controller("jmUserController", function ($scope, $location, $timeout, $mdDialog, $mdToast, jmDB) {
        $scope.tabs = ['required', 'additional', 'spouse', 'dates and places', 'children / pets'];
        $scope.selectedTab = 0;

        var toast = function (msg, error) {
            $scope[$scope.formName].$setPristine();
            var errorClass = (error) ? 'class="error"' : undefined;

            $mdToast.show({
                template: '<md-toast ' + errorClass + '><span><b>' + msg + '</b></span></md-toast>',
                hideDelay: 2000,
                position: 'top right'
            });
        };

        if (!$scope.formName) {
            $scope.formName = 'userForm';
        }

        $scope.$root.$on('putItem', function () {
            $scope.putItem();
        });

        $scope.$root.$on('selectUser', function (event, user) {
            $scope.selectedUser = user;
            $scope.selectedTab = 0;
        });

        $scope.deleteItem = function (event) {

            $mdDialog.show($mdDialog.confirm()
                .title('Remove ' + $scope.selectedUser.firstName + ' ' + $scope.selectedUser.lastName + ' - are you sure?')
                .content('All the data and the entry itself will be removed')
                .ok('Remove')
                .cancel('Cancel')
                .targetEvent(event)).then(
                function () {
                    jmDB.deleteItem($scope.selectedUser).then(
                        function () {
                            angular.element('#user-' + $scope.selectedUser.id).remove();
                            $scope.$root.$emit('userRemoved');
                            $scope[$scope.formName].$setPristine();
                            toast('Removed');
                        },
                        function () {
                            toast('There was a problem removing...', true);
                        });
                }, function () {
                    $scope.alert = 'You decided to keep your debt.';
                });
        };

        $scope.putItem = function () {
            var promise = jmDB.putItem($scope.selectedUser);

            promise.then(
                function () {
                    toast(($scope.addUser) ? 'User Added' : 'Saved');

                    if ($scope.addUser) {
                        $mdDialog.hide();
                        $scope.$root.$emit('refresh', $scope.selectedUser.id);
                        $scope.addUser = false;
                    }
                },
                function () {
                    toast('There was a problem saving...', true);
                });
        };

        $scope.add = function (event) {

            $scope.addUser = true;

            $mdDialog.show({
                controller: 'jmDialogController',
                templateUrl: 'user/dialog.tpl.html',
                targetEvent: event,
                clickOutsideToClose: false
            }).then(undefined, function () {
                $scope.addUser = false;
            });
        };

        $scope.next = function () {
            $scope.selectedTab = Math.min($scope.selectedTab + 1, 2);
        };

        $scope.previous = function () {
            $scope.selectedTab = Math.max($scope.selectedTab - 1, 0);
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
    })

    .directive("jmUser", function () {
        return {
            scope: true,
            templateUrl: 'user/user.tpl.html',
            controller: 'jmUserController'
        };
    })

    .directive('jmAddButton', function () {
        return {
            scope: true,
            templateUrl: 'user/button.tpl.html',
            controller: 'jmUserController'
        };
    })

    .directive('jmAddButtonDesktop', function () {
        return {
            scope: true,
            templateUrl: 'user/buttonDesktop.tpl.html',
            controller: 'jmUserController'
        };
    });