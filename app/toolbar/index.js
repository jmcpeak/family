'use strict';

import md from 'angular-material';
import toolbar from './index.tpl.html';
import menuSheet from './menu-sheet.tpl.html';
import deleteSheet from './delete-sheet.tpl.html';
import sortSheet from './sort-sheet.tpl.html';
import mobileMenu from './mobile-menu.tpl.html';
import search from './search.tpl.html';
import about from './about.tpl.html';
import aboutDialog from './about-dialog.tpl.html';
import 'ngstorage';

export default angular.module('jmList', [md, 'ngStorage'])

    .controller('jmToolbarController', function ($window, $location, $sessionStorage, $state, $mdBottomSheet, $mdDialog,
                                                 $mdSidenav, jmDB, jmThemeService) {
        let originatorEv,
            getTitle = (user)=> {
                let pre = 'Remove ',
                    fn = user.firstName ? user.firstName : '',
                    ln = user.lastName ? user.lastName : '',
                    name = fn + ' ' + ln;

                return name.length > 1 ? pre + name + ' - are you sure?' : pre + 'user?';
            },
            deleteUser = (user)=> {
                jmDB.deleteItem(user).then(() => {
                        // Delete the card
                        angular.element(jmConstant.userIdHash).remove();

                        // Remove from users array
                        for (let i in $scope.users) {
                            if ($scope.users[i].id === $scope.selectedUser.id) {
                                $scope.users.splice(i, 1);
                                break;
                            }
                        }

                        if ($scope.users.length >= 1)
                            $scope.selectUser($scope.users[0]);

                        toast('Deleted');
                    },
                    ()=> {
                        toast('Error: User NOT Deleted', true);
                    });
            },
            init = () => {
                this.themeLabel = jmThemeService.label();
            };

        this.bottomSheetCancel = () => $mdBottomSheet.cancel();
        this.dialogCancel = () => $mdDialog.cancel();
        this.showEdit = this.edit && this.edit.toLowerCase() === 'true' ? true : false;

        this.toggle = (sideNavId) => $mdSidenav(sideNavId).toggle();

        this.toggleSearch = () => {
            this.search = '';
            return this.toggle('search');
        };

        this.feedback = () => $window.location.href = 'https://github.com/jmcpeak/family/issues';

        this.about = ()=> {
            $mdSidenav('mobileMenu').toggle();
            $mdSidenav('about').toggle();
        };

        this.aboutDialog = ()=> {
            $mdDialog.show({
                template: aboutDialog,
                targetEvent: originatorEv,
                clickOutsideToClose: true,
                controllerAs: '$ctrl',
                controller: 'jmToolbarController'
            });
        };

        this.logout = ()=> {
            $sessionStorage.sessionToken = undefined;
            $state.go('login');
        };

        this.theme = () => jmThemeService.toggle().then((label) => this.themeLabel = label);

        this.openMenu = ($mdOpenMenu, $event) => {
            originatorEv = $event;
            $mdOpenMenu($event);
        };

        this.isSaveDisabled = () => {
            //let disabled = true;
            //let form = jmService.getRequiredForm();
            //
            //if ($scope.addUser) {
            //    disabled = cachedDisableSaveValue;
            //} else {
            //    disabled = form && (form.$invalid || form.$pristine);
            //    cachedDisableSaveValue = disabled;
            //}
            //
            //return disabled;
        };

        this.deleteDialog = (user)=> {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title(getTitle(user))
                    .content('All the data and the entry itself will be removed')
                    .ok('Remove')
                    .cancel('Cancel')
                    .targetEvent(originatorEv)).then(deleteUser);
        };

        this.deleteSheet = () => {
            $mdBottomSheet.show({
                template: deleteSheet,
                controllerAs: '$ctrl',
                controller: 'jmToolbarController'
            });
        };

        this.menuSheet = () => {
            $mdBottomSheet.show({
                template: menuSheet,
                controllerAs: '$ctrl',
                controller: 'jmToolbarController'
            });
        };

        this.sortSheet = () => {
            $mdBottomSheet.show({
                template: sortSheet,
                controllerAs: '$ctrl',
                controller: 'jmToolbarController'
            }).then((data) => this.orderBy = data);
        };

        this.sort = (sortBy) => {
            switch (sortBy.toLowerCase()) {
                case 'fname':
                    this.sortBy = ['firstName', 'lastName'];
                    break;

                case 'lname':
                    this.sortBy = ['lastName', 'firstName'];
                    break;

                case 'age':
                    this.sortBy = ['birthday', 'lastName', 'firstName'];
                    break;

                case 'state':
                    this.sortBy = ['theState', 'lastName', 'firstName'];
                    break;

                default:
                    this.sortBy = ['lastName', 'firstName'];
            }

            $mdBottomSheet.hide(this.sortBy);
        };

        init();
    })

    .component('jmAbout', {
        template: about,
        controller: 'jmToolbarController'
    })

    .component('jmMobileMenu', {
        template: mobileMenu,
        controller: 'jmToolbarController'
    })

    .component('jmSearch', {
        bindings: {
            search: '=?'
        },
        template: search,
        controller: 'jmToolbarController'
    })

    .component('jmToolbar', {
        bindings: {
            edit: '@?',
            filter: '=?',
            orderBy: '=?'
        },
        template: toolbar,
        controller: 'jmToolbarController'
    }).name;
