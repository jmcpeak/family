'use strict';

angular.module('jmUser', ['ngMaterial', 'jmPartials'])

    .controller('jmDialogController', function ($scope, $rootScope, $mdDialog, jmDB) {
        $scope.selectedUser = {id: jmDB.guid()};
        $scope.formName = 'addUser';

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.putItem = function () {
            $rootScope.$emit('putItem');
        };
    })

    .controller("jmUserController", function ($scope, $rootScope, $location, $mdDialog, $mdToast, jmDB) {
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

        $rootScope.$on('putItem', function () {
            $scope.putItem();
        });

        $rootScope.$on('selectUser', function (event, user) {
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
            templateUrl: 'user/user.tpl.html',
            controller: 'jmUserController'
        };
    })

    .directive('jmAddButton', function () {
        return {
            templateUrl: 'user/button.tpl.html',
            controller: 'jmUserController'
        };
    })

    .directive("jmLogin", function () {
        return {
            templateUrl: 'user/login.tpl.html',
            controller: function ($scope, $rootScope, $element, $timeout, $sessionStorage) {

                $scope.showMainPage = ($sessionStorage.sessionToken) ? true : false;

                $scope.showLoginFields = (!$sessionStorage.sessionToken) ? true : false;

                $scope.submit = function () {
                    if (this.loginForm.question.$modelValue.toLowerCase().hashCode() === 463258776) {
                        this.displayCircularProgressIndicator = true;
                        this.showLoginFields = false;

                        angular.bind(this, AWS.config.credentials.get(function (error) {
                            $timeout(function () {
                                $scope.displayCircularProgressIndicator = !$scope.displayCircularProgressIndicator;

                                if (error) {
                                    //$sessionStorage.sessionToken = 'delete me';
                                    $scope.showLoginFields = !$scope.showLoginFields;
                                    $scope.error = {
                                        amazonError: true,
                                        message: (error.message) ? error.message : 'Unknown Error'
                                    };
                                    $timeout(function () {
                                        $element.find('input').focus();
                                    }, 90);
                                } else {
                                    $scope.showMainPage = !$scope.showMainPage;
                                    $sessionStorage.sessionToken = AWS.config.credentials.sessionToken;
                                }
                            });
                        }));
                    } else {
                        this.error = {badPassword: true};
                    }
                };

                $timeout(function () {
                    $element.find('input').focus();
                }, 50);
            }
        };
    })