'use strict';

import md from "angular-material";

export default angular.module('jmPartials', [md])

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

    .controller('jmPartialController', function ($scope, $window, jmConstant) {
        let hasValidAddress = (user) => {
                user = user ? user : $scope.selectedUser;
                return (user && user.theState &&
                (user.address && user.address.length > 5) &&
                (user.city && user.city.length > 4)) ? true : false;
            },
            getAddress = (user) => {
                user = user ? user : $scope.selectedUser;
                return $window.encodeURIComponent(user.address + ',' + user.city + ',' + user.theState);
            };

        $scope.states = jmConstant.states;
        $scope.addressDefined = () => hasValidAddress();
        $scope.getStreetViewURL = () => jmConstant.streetViewBase + getAddress() + jmConstant.streetViewSuffix;
        $scope.getGoogleMapsURL = () => jmConstant.googleMapsBase + getAddress();
    })

    .controller('jmRequiredController', function ($scope, jmService, jmDB) {
        let parents = (resp, gender) => {
                let parents = [{id: '', firstName: '', lastName: ''}];
                angular.forEach(resp, function (entry) {
                    if (entry.genderSpouse === gender) {
                        parents.push({
                            id: entry.id,
                            firstName: entry.firstNameSpouse,
                            lastName: entry.lastNameSpouse
                        });
                    } else {
                        parents.push({id: entry.id, firstName: entry.firstName, lastName: entry.lastName});
                    }
                });
                return parents;
            },
            possibleFirstNames = (user, first, nick, title) => {
                let names = [];

                let firstName = user[first] ? user[first].trim() : '';
                let firstNameWithNickname;
                let firstNameAsNickname;
                let firstNameWithTitle;

                names.push({display: firstName});

                if (user[nick]) {
                    firstNameWithNickname = firstName + ' "' + user[nick].trim() + '" ';
                    firstNameAsNickname = user[nick].trim();
                    names.push({display: firstNameAsNickname});
                    names.push({display: firstNameWithNickname});
                }

                if (user[title]) {
                    let titleName = user[title].trim() + ' ';
                    firstNameWithTitle = titleName + firstName;
                    names.push({display: firstNameWithTitle});

                    if (user[nick]) {
                        names.push({display: titleName + firstNameWithNickname});
                        names.push({display: titleName + firstNameAsNickname});
                    }
                }

                return names;
            },
            buildNames = (user) => {
                let possible = [{names: undefined}];

                if (user.lastName && user.firstName) {

                    let spouse, member, memberLastName, memberLastNameWithSuffix, spouseLastName, spouseLastNameWithSuffix;

                    memberLastName = user.lastName.trim();
                    memberLastNameWithSuffix = user.lastName.trim() + (user.suffixName ? ' ' + user.suffixName.trim() : '');

                    if (user.lastNameSpouse) {
                        spouseLastName = user.lastNameSpouse.trim();
                        spouseLastNameWithSuffix = user.lastNameSpouse.trim() + (user.suffixNameSpouse ? ' ' + user.suffixNameSpouse.trim() : '');
                    }

                    member = possibleFirstNames(user, 'firstName', 'nickName', 'titleName');

                    if (user.firstNameSpouse) {
                        spouse = possibleFirstNames(user, 'firstNameSpouse', 'nickNameSpouse', 'titleNameSpouse');
                    }

                    angular.forEach(member, function (name) {
                        possible.push({display: name.display + ' ' + memberLastName});
                        if (memberLastNameWithSuffix !== memberLastName) {
                            possible.push({display: name.display + ' ' + memberLastNameWithSuffix});
                        }
                    });

                    angular.forEach(spouse, function (name) {
                        possible.push({display: name.display + ' ' + spouseLastName});
                        if (spouseLastNameWithSuffix !== spouseLastNameWithSuffix) {
                            possible.push({display: name.display + ' ' + spouseLastNameWithSuffix});
                        }
                    });

                    angular.forEach(member, function (name) {
                        angular.forEach(spouse, function (spouseName) {
                            possible.push({display: name.display + ' & ' + spouseName.display + ' ' + memberLastName});
                            if (memberLastNameWithSuffix !== memberLastName) {
                                possible.push({display: name.display + ' & ' + spouseName.display + ' ' + memberLastNameWithSuffix});
                            }
                        });
                    });

                    angular.forEach(spouse, function (name) {
                        angular.forEach(member, function (memberName) {
                            possible.push({display: name.display + ' & ' + memberName.display + ' ' + spouseLastName});
                            if (spouseLastNameWithSuffix !== spouseLastNameWithSuffix) {
                                possible.push({display: name.display + ' & ' + memberName.display + ' ' + spouseLastNameWithSuffix});
                            }
                        });
                    });
                }

                return possible;
            },
            init = () => {
                jmService.setRequiredForm($scope.userForm0);

                if ($scope.selectedUser) {
                    $scope.names = buildNames(angular.copy($scope.selectedUser));
                }

                jmDB.queryParents('m').then((resp) => $scope.fathers = parents(resp, 'm'));
                jmDB.queryParents('f').then((resp) => $scope.mothers = parents(resp, 'f'));
            };

        $scope.names = [];
        $scope.update = () => init();

        init();
    })

    .controller('jmChildrenController', function ($scope) {
        $scope.fields = ['firstNameChild', 'middleNameChild', 'lastNameChild', 'bithdayChild', 'genderChild'];

        $scope.addChild = () => {
            let lastOne = $scope.selectedUser.children.slice(-1).pop();
            $scope.selectedUser.children.push(++lastOne);
        };

        $scope.removeChild = function (event, index) {
            $scope.selectedUser.children.splice($scope.selectedUser.children.indexOf(index), 1);
            angular.forEach($scope.fields, function (field) {
                delete $scope.selectedUser[field + index];
            });
        };

        $scope.$on('selectUser', function (event, user) {
            if (user && !user.children) {
                $scope.selectedUser.children = [0];
            }
        });
    })

    .directive('jmRequired', () => {
        return {
            require: '^form',
            template: require('../partials/required.tpl.html'),
            controller: 'jmRequiredController'
        };
    })

    .directive('jmAddress', () => {
        return {
            require: '^form',
            template: require('../partials/address.tpl.html'),
            controller: 'jmPartialController'
        };
    })

    .directive('jmSpouse', () => {
        return {
            require: '^form',
            template: require('../partials/spouse.tpl.html'),
            controller: 'jmPartialController'
        };
    })

    .directive('jmDatesAndPlaces', () => {
        return {
            require: '^form',
            template: require('../partials/datesAndPlaces.tpl.html'),
            controller: 'jmPartialController'
        };
    })

    .directive('jmChildren', () => {
        return {
            require: '^form',
            template: require('../partials/children.tpl.html'),
            controller: 'jmChildrenController'
        };
    }).name;
