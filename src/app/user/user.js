'use strict';

angular.module('jmUser', ['ngMaterial', 'jmPartials'])

    .controller('jmDialogController', function ($scope, $mdDialog, jmDB) {
        $scope.selectedUser = {id: jmDB.guid(), children: [0]};

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.ok = function () {
            $mdDialog.hide($scope.selectedUser);
        };
    })

    .directive('jmContentArea', function () {
        return {
            replace: true,
            templateUrl: 'user/content.tpl.html'
        };
    })

    .directive('jmTabs', function () {
        return {
            templateUrl: 'user/tabs.tpl.html',
            controller: function ($scope, $mdDialog, $mdToast, $localStorage, $mdSidenav, jmDB, jmService, jmConstant) {
                var cachedDisableSaveValue;
                var showNgStats;

                var toast = function (msg, isError) {
                    var errorClass = (isError) ? 'class="error"' : undefined;

                    $mdToast.show({
                        template: '<md-toast ' + errorClass + '><b>' + msg + '</b></md-toast>',
                        hideDelay: 2000,
                        position: 'top right'
                    });
                };

                var confirmSave = function (event) {
                    return $mdDialog.show($mdDialog.confirm()
                        .title('Save your changes?')
                        .content('You have made changes - do you want to save them before continuing?')
                        .ariaLabel('Save')
                        .ok('Save')
                        .cancel('Don\'t Save')
                        .targetEvent(event));
                };

                $scope.tabs = [
                    {name: 'family member', position: 0},
                    {name: 'address', position: 1},
                    {name: 'spouse', position: 2},
                    {name: 'dates / places', position: 3},
                    {name: 'children / pets', position: 4}];
                $scope.selectedTab = 0;

                $scope.isRemoveDisabled = function () {
                    return !angular.isDefined($scope.selectedUser);
                };

                $scope.isSaveDisabled = function () {
                    var disabled = true;
                    var form = jmService.getRequiredForm();

                    if ($scope.addUser) {
                        disabled = cachedDisableSaveValue;
                    } else {
                        disabled = form && (form.$invalid || form.$pristine);
                        cachedDisableSaveValue = disabled;
                    }

                    return disabled;
                };

                $scope.isAddDisabled = function () {
                    return jmService.getRequiredForm() && jmService.getRequiredForm().$invalid;
                };

                $scope.deleteItem = function (event) {
                    var title = function () {
                        var pre = 'Remove ';
                        var fn = $scope.selectedUser.firstName ? $scope.selectedUser.firstName : '';
                        var ln = $scope.selectedUser.lastName ? $scope.selectedUser.lastName : '';
                        var name = fn + ' ' + ln;
                        return name.length > 1 ? pre + name + ' - are you sure?' : pre + 'user?';
                    };

                    $mdDialog.show(
                        $mdDialog.confirm()
                            .title(title())
                            .content('All the data and the entry itself will be removed')
                            .ok('Remove')
                            .cancel('Cancel')
                            .targetEvent(event)).then(function () {
                            jmDB.deleteItem($scope.selectedUser).then(function () {
                                    // Delete the card
                                    angular.element(jmConstant.userIdHash).remove();

                                    // Remove from users array
                                    for (var i in $scope.users) {
                                        if ($scope.users[i].id === $scope.selectedUser.id) {
                                            $scope.users.splice(i, 1);
                                            break;
                                        }
                                    }

                                    if ($scope.users.length >= 1) {
                                        $scope.selectUser($scope.users[0]);
                                    }

                                    toast('Removed');
                                },
                                function () {
                                    toast('Error: NOT Removed', true);
                                });
                        });
                };

                $scope.selectUser = function (user, event) {

                    var select = function () {
                        $scope.selectedUser = user;
                        $localStorage.user = user;
                        $scope.selectedTab = 0;

                        jmService.resetPreviousCard();
                        jmService.setSelectedCard(angular.element(jmConstant.userIdHash + user.id));

                        $scope.$broadcast('selectUser', user);
                    };

                    if (jmService.getRequiredForm() && jmService.getRequiredForm().$dirty) {

                        confirmSave(event).then(function () {
                            $scope.putItem($scope.selectedUser);
                            select();
                        }, function () {
                            jmService.getRequiredForm().$setPristine();
                            jmService.getRequiredForm().$setUntouched();
                            select();
                        });
                    } else {
                        select();
                    }
                };

                $scope.putItem = function (user) {

                    return jmDB.putItem(user).then(
                        function () {
                            toast($scope.addUser ? 'Added' : 'Saved');

                            $scope.lastUpdatedID = user.id;
                            jmService.getRequiredForm().$setSubmitted();
                            jmService.getRequiredForm().$setPristine();
                            jmService.getRequiredForm().$setUntouched();

                            if ($scope.addUser) {
                                jmService.usePreviousForm();
                                $scope.refresh(user, true);
                                $scope.addUser = !$scope.addUser;
                            }
                        },
                        function () {
                            toast('NOT Saved', true);
                        });
                };

                $scope.add = function (event) {

                    var that = this;
                    var add = function () {
                        var newScope = $scope.$new();
                        newScope.addUser = true;

                        $mdDialog.show({
                            controller: 'jmDialogController',
                            templateUrl: 'user/dialog.tpl.html',
                            targetEvent: event,
                            scope: newScope,
                            focusOnOpen: false
                        }).then(function (user) {
                            that.putItem(user);
                        }, function () {
                            $scope.addUser = false;
                            jmService.usePreviousForm();
                        });
                    };

                    if (jmService.getRequiredForm().$dirty) {
                        confirmSave(event).then(function () {
                            that.putItem(that.selectedUser).then(function () {
                                $scope.addUser = true;
                                add();
                            });
                        }, function () {
                            $scope.addUser = true;
                            add();
                        });
                    } else {
                        $scope.addUser = true;
                        add();
                    }
                };

                $scope.next = function () {
                    $scope.selectedTab = Math.min($scope.selectedTab + 1, 2);
                };

                $scope.previous = function () {
                    $scope.selectedTab = Math.max($scope.selectedTab - 1, 0);
                };

                $scope.toggleSearch = function (id) {
                    $mdSidenav(id).toggle();
                    $scope.search = '';
                };

                $scope.about = function (event) {
                    $mdDialog.show({
                        templateUrl: 'user/about.tpl.html',
                        targetEvent: event,
                        clickOutsideToClose: true,
                        controller: 'jmDialogController'
                    });
                };

                $scope.toggleNgStats = function () {
                    showNgStats = !showNgStats;

                    $scope.ngStatsLabel = (showNgStats) ? 'Hide' : 'Show';

                    var options = (showNgStats) ? {
                        position: 'bottomright',
                        logDigest: true,
                        logWatches: true
                    } : false;

                    showAngularStats(options); // jshint ignore:line
                };
            }
        };
    })

    .directive('jmLogin', function () {
        return {
            replace: true,
            templateUrl: 'user/login.tpl.html',
            controller: function ($scope, $element, $timeout, $sessionStorage, $localStorage, jmConstant) {

                $scope.genders = jmConstant.genders;

                $scope.showMainPage = $sessionStorage.sessionToken ? true : false;

                $scope.showLoginFields = (!$sessionStorage.sessionToken) ? true : false;

                $scope.login = function () {
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

                                    if ($localStorage.user) {
                                        $scope.selectUser($localStorage.user);
                                        $timeout(function () {
                                            angular.element(jmConstant.userIdHash + $localStorage.user.id).click()[0].scrollIntoView(false);
                                        });
                                    }
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