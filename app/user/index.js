'use strict';

import md from "angular-material";
import partials from "../partials";
import showAngularStats from "ng-stats";
import "angular-clipboard";

export default angular.module('jmUser', [md, partials, 'angular-clipboard'])

    .service('jmService', function () {
        let card, form, outline, previousForm;

        this.getRequiredForm = () => form;
        this.usePreviousForm = () => form = previousForm;

        this.setRequiredForm = (value) => {
            previousForm = form;
            form = value;
        };

        this.resetPreviousCard = () => {
            if (card) {
                card.css('outline', outline);
            }
        };

        this.setSelectedCard = (value) => {
            card = value;
            outline = card.css('outline');
            card.css('outline', '4px auto -webkit-focus-ring-color');
        };
    })

    .controller('jmDialogController', function ($mdDialog, jmDB) {
        let showNgStats;

        this.selectedUser = {id: jmDB.guid(), children: [0]};
        this.cancel = () => $mdDialog.cancel();
        this.ok = () => $mdDialog.hide(this.selectedUser);
        this.toggleNgStats = () => {
            let options = (showNgStats) ? {
                position: 'bottomright',
                logDigest: true,
                logWatches: true
            } : false;

            showNgStats = !showNgStats;

            this.ngStatsLabel = (showNgStats) ? 'Hide' : 'Show';

            showAngularStats(options);
        };
    })

    .controller('jmTabsController', function ($scope, $document, $mdDialog, $mdToast, $localStorage, $mdSidenav, $mdMedia, jmDB, jmService, jmConstant) {
        let cachedDisableSaveValue,
            originatorEv,
            toast = (msg, isError) => {
                let errorClass = (isError) ? 'class="error"' : undefined;

                $mdToast.show({
                    template: '<md-toast ' + errorClass + '><b>' + msg + '</b></md-toast>',
                    hideDelay: 2000,
                    position: 'top right'
                });
            },
            confirmSave = (event) => {
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
        $scope.isRemoveDisabled = () => !angular.isDefined($scope.selectedUser);
        $scope.isAddDisabled = () => jmService.getRequiredForm() && jmService.getRequiredForm().$invalid;
        $scope.next = ()=> $scope.selectedTab = Math.min($scope.selectedTab + 1, 2);
        $scope.previous = ()=> $scope.selectedTab = Math.max($scope.selectedTab - 1, 0);
        $scope.isClear = ()=> $scope.search ? !$scope.search.length : 1;

        $scope.isSaveDisabled = () => {
            let disabled = true;
            let form = jmService.getRequiredForm();

            if ($scope.addUser) {
                disabled = cachedDisableSaveValue;
            } else {
                disabled = form && (form.$invalid || form.$pristine);
                cachedDisableSaveValue = disabled;
            }

            return disabled;
        };

        $scope.deleteItem = ()=> {
            let title = ()=> {
                let pre = 'Remove ';
                let fn = $scope.selectedUser.firstName ? $scope.selectedUser.firstName : '';
                let ln = $scope.selectedUser.lastName ? $scope.selectedUser.lastName : '';
                let name = fn + ' ' + ln;
                return name.length > 1 ? pre + name + ' - are you sure?' : pre + 'user?';
            };

            $mdDialog.show(
                $mdDialog.confirm()
                    .title(title())
                    .content('All the data and the entry itself will be removed')
                    .ok('Remove')
                    .cancel('Cancel')
                    .targetEvent(originatorEv)).then(()=> {
                jmDB.deleteItem($scope.selectedUser).then(()=> {
                        // Delete the card
                        angular.element(jmConstant.userIdHash).remove();

                        // Remove from users array
                        for (let i in $scope.users) {
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
                    ()=> {
                        toast('Error: NOT Removed', true);
                    });
            });
        };

        $scope.selectUser = (user, event) => {
            let select = ()=> {
                $scope.selectedUser = user;
                $localStorage.user = user;
                $scope.selectedTab = 0;

                jmService.resetPreviousCard();

                jmService.setSelectedCard(angular.element($document.find(jmConstant.userIdHash + user.id)));

                $scope.$broadcast('selectUser', user);
            };

            if (jmService.getRequiredForm() && jmService.getRequiredForm().$dirty) {

                confirmSave(event).then(()=> {
                    $scope.putItem($scope.selectedUser);
                    select();
                }, ()=> {
                    jmService.getRequiredForm().$setPristine();
                    jmService.getRequiredForm().$setUntouched();
                    select();
                });
            } else {
                select();
            }

            $scope.closeSearch();
        };

        $scope.putItem = (user) => {
            return jmDB.putItem(user).then(()=> {
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
            }, ()=> toast('NOT Saved', true));
        };

        $scope.add = (event) => {
            let add = ()=> {
                $mdDialog.show({
                    targetEvent: event,
                    bindToController: true,
                    template: require('../user/dialog.tpl.html'),
                    controller: 'jmDialogController',
                    controllerAs: 'jmDialogCtrl'
                }).then((user) => this.putItem(user), ()=> {
                    $scope.addUser = false;
                    jmService.usePreviousForm();
                });
            };

            if (jmService.getRequiredForm().$dirty) {
                confirmSave(event).then(()=> {
                    this.putItem(this.selectedUser).then(()=> {
                        $scope.addUser = true;
                        add();
                    });
                }, ()=> {
                    $scope.addUser = true;
                    add();
                });
            } else {
                $scope.addUser = true;
                add();
            }
        };

        $scope.toggleSearch = ()=> {
            $mdSidenav('search').toggle();
            $scope.search = '';
        };

        $scope.closeSearch = ()=> {
            $mdSidenav('search').close();
            $scope.search = '';
        };

        $scope.clear = ()=> {
            $scope.search = '';
            angular.element(document.querySelector('#searchBox')).focus();
        };

        $scope.openMenu = ($mdOpenMenu, $event) => {
            originatorEv = $event;
            $mdOpenMenu($event);
        };

        $scope.email = ()=> {
            jmDB.getEmailAddresses().then((addresses) => {
                let emailAddresses;
                let sep = $mdMedia('lg') ? '; ' : ', ';
                angular.forEach(addresses, (address) => {
                    emailAddresses = emailAddresses ? emailAddresses + sep + address.email : address.email;
                });

                return $mdDialog.show({
                    targetEvent: originatorEv,
                    bindToController: true,
                    locals: {
                        emailAddresses: emailAddresses
                    },
                    template: require('../user/email.tpl.html'),
                    controllerAs: 'dialog',
                    controller: function ($mdDialog) {
                        this.cancel = ()=> $mdDialog.cancel();
                    }
                });
            });
        };
    })

    .controller('jmLoginController', function ($scope, $element, $timeout, $sessionStorage, $localStorage, jmConstant) {
        let init = () => {
            $timeout(()=> {
                $element.find('input').focus();
            }, 50);
        };

        $scope.genders = jmConstant.genders;
        $scope.showMainPage = $sessionStorage.sessionToken ? true : false;
        $scope.showLoginFields = (!$sessionStorage.sessionToken);

        $scope.login = () => {
            if ($scope.city.toLowerCase().hashCode() === 463258776) {
                $scope.displayCircularProgressIndicator = true;
                $scope.showLoginFields = false;

                angular.bind($scope, AWS.config.credentials.get((error) => {
                    $timeout(()=> {
                        $scope.displayCircularProgressIndicator = !$scope.displayCircularProgressIndicator;

                        if (error) {
                            $scope.showLoginFields = !$scope.showLoginFields;
                            $scope.error = {
                                amazonError: true,
                                message: (error.message) ? error.message : 'Unknown Error'
                            };
                            init();
                        } else {
                            $scope.showMainPage = !$scope.showMainPage;
                            $sessionStorage.sessionToken = AWS.config.credentials.sessionToken;

                            if ($localStorage.user) {
                                $scope.selectUser($localStorage.user);
                                $timeout(()=> {
                                    angular.element(jmConstant.userIdHash + $localStorage.user.id).click()[0].scrollIntoView(false);
                                });
                            }
                        }
                    });
                }));
            } else {
                $scope.error = {badPassword: true};
            }
        };

        init();
    })

    .directive('jmContentArea', () => {
        return {
            //replace: true,
            controller: function ($scope) {
                let exportResolve = (entries) => {
                    let link = document.createElement('a');
                    link.setAttribute('href', encodeURI('data:text/csv;charset=utf-8,' + entries));
                    link.setAttribute('download', 'McPeak Family.csv');
                    link.click();
                };

                $scope.export = () => jmDB.exportToCSV().then(exportResolve);

                $scope.getCount = (data) => {
                    if (data) {
                        let additional = 0;
                        angular.forEach(data, (entry) => {
                            if (entry.firstNameSpouse && entry.firstNameSpouse.length >= 1) {
                                additional++;
                            }

                            angular.forEach(entry.children, (child) => {
                                if (entry['firstNameChild' + child] && entry['firstNameChild' + child].length >= 1) {
                                    additional++;
                                }
                            });
                        });

                        return data.length + additional;
                    }
                };
            },
            template: require('../user/content.tpl.html')
        };
    })

    .directive('jmTabs', () => {
        return {
            template: require('../user/tabs.tpl.html'),
            controller: 'jmTabsController'
        };
    })

    .directive('jmLogin', () => {
        return {
            //replace: true,
            template: require('../user/login.tpl.html'),
            controller: 'jmLoginController'
        };
    }).name;
