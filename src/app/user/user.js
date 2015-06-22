'use strict';

angular.module('jmUser', ['ngMaterial', 'jmPartials'])

    .controller('jmDialogController', function ($scope, $timeout, $mdDialog, jmDB) {
        $scope.selectedUser = {id: jmDB.guid()};

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.isDialogAddDisabled = function () {
            return $scope.userForm && $scope.userForm.$invalid;
        };
    })

    .controller('jmUserController', function ($scope, $rootScope, $timeout, $location, $mdDialog, $mdToast, jmDB) {
        $scope.tabs = ['required', 'additional', 'spouse', 'dates and places', 'children / pets'];
        $scope.selectedTab = 0;

        var toast = function (msg, error) {
            $scope[$scope.formName].$setPristine();
            var errorClass = (error) ? 'class="error"' : undefined;

            $mdToast.show({
                template: '<md-toast ' + errorClass + '><span><b>' + msg + '</b></span></md-toast>',
                hideDelay: 2000,
                position: 'bottom right'
            });
        };

        if (!$scope.formName) {
            $scope.formName = 'userForm';
        }

        $scope.deleteItem = function (event) {
            var pre = 'Remove ';
            var fn = $scope.selectedUser.firstName ? $scope.selectedUser.firstName : '';
            var ln = $scope.selectedUser.lastName ? $scope.selectedUser.lastName : '';
            var name = fn + ' ' + ln;
            var title = name.length > 1 ? pre + name + ' - are you sure?' : pre + 'user?';

            $mdDialog.show($mdDialog.confirm()
                .title(title)
                .content('All the data and the entry itself will be removed')
                .ok('Remove')
                .cancel('Cancel')
                .targetEvent(event)).then(function () {
                jmDB.deleteItem($scope.selectedUser).then(
                    function () {
                        var id = $scope.selectedUser.id;

                        // Delete the card
                        angular.element('#user-' + id).remove();

                        // Update count
                        $scope.count--;

                        // Set form pristine
                        $scope[$scope.formName].$setPristine();

                        // Remove from users array
                        for (var i in $scope.users) {
                            if ($scope.users[i].id === id) {
                                $scope.users.splice(i, 1);
                            }
                        }

                        if ($scope.users.length >= 1) {
                            $scope.selectUser($scope.users[0]);
                        }

                        toast('User Removed');
                    },
                    function () {
                        toast('There was a problem removing...', true);
                    });
            });
        };

        $scope.isRemoveDisabled = function () {
            return !angular.isDefined($scope.selectedUser);
        };

        $scope.isSaveDisabled = function () {
            return $scope.userForm && $scope.userForm.$invalid;
        };

        $scope.selectUser = function (user) {
            $scope.selectedUser = user;
            $scope.selectedTab = 0;
        };

        $scope.putItem = function () {
            jmDB.putItem($scope.selectedUser).then(
                function () {
                    toast(($scope.addUser) ? 'User Added' : 'User Saved');

                    if ($scope.addUser) {
                        $mdDialog.hide();
                        $rootScope.$emit('refresh', $scope.selectedUser);
                    }
                },
                function () {
                    toast('There was a problem saving...', true);
                });
        };

        $scope.add = function (event) {

            $scope.addUser = true;

            var newScope = $scope.$new();
            newScope.addUser = true;

            $mdDialog.show({
                controller: 'jmDialogController',
                templateUrl: 'user/dialog.tpl.html',
                targetEvent: event,
                clickOutsideToClose: false,
                scope: newScope,
                focusOnOpen: false
            }).then(function () {
                $scope.addUser = false;
            }, function () {
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

    .directive('jmUser', function () {
        return {
            replace: true,
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

    .directive('jmLogin', function () {
        return {
            templateUrl: 'user/login.tpl.html',
            controller: function ($scope, $rootScope, $element, $timeout, $sessionStorage) {

                $scope.showMainPage = $sessionStorage.sessionToken ? true : false;

                $scope.showLoginFields = (!$sessionStorage.sessionToken) ? true : false;

                $scope.submit = function () {
                    if (this.loginForm.question.$modelValue.toLowerCase().hashCode() === 463258776) {
                        this.displayCircularProgressIndicator = true;
                        this.showLoginFields = false;

                        angular.bind(this, AWS.config.credentials.get(function (error) {
                            $timeout(function () {
                                $scope.displayCircularProgressIndicator = !$scope.displayCircularProgressIndicator;

                                if (error) {
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
    });