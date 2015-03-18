'use strict';

angular.module('jmUser', ['ngMaterial'])

    .directive("jmUser", function () {
        return {
            templateUrl: 'user/user.tpl.html',
            controller: function ($scope, $location, $timeout, $mdDialog, $mdToast, jmDB) {
                $scope.tabs = ['required', 'additional', 'spouse', 'dates and places', 'children / pets'];
                $scope.selectedIndex = 0;

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

                $scope.deleteItem = function (event) {

                    $mdDialog.show($mdDialog.confirm()
                        .title('Are you sure?')
                        .content('All the data and the entry itself will be removed')
                        .ok('Remove')
                        .cancel('Cancel')
                        .targetEvent(event)).then(
                        function () {
                            jmDB.deleteItem($scope.selectedUser).then(
                                function () {
                                    angular.element('#user-' + $scope.selectedUser.id).remove();

                                    $scope.$apply(
                                        $scope.selectedUser = $scope.users[0]
                                    );

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
                                $scope.refesh($scope.selectedUser.id);
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
                        targetEvent: event
                    }).then(function () {
                    }, function () {
                        $scope.addUser = false;
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

                $scope.isDisabled = function () {
                    return $scope[$scope.formName].$pristine || $scope[$scope.formName].$invalid;
                };
            }
        };
    })

    .directive('jmAddButton', function () {
        return {
            templateUrl: 'user/button.tpl.html'
        };
    })

    .directive('jmAddButtonDesktop', function () {
        return {
            templateUrl: 'user/buttonDesktop.tpl.html'
        };
    })

    .directive('jmDialog', function () {
        return {
            templateUrl: 'user/dialog.tpl.html'
        };
    })

    .controller('jmDialogController', function ($scope, jmDB) {
        $scope.selectedUser = {id: jmDB.guid()};
        $scope.formName = 'addUser';
    });