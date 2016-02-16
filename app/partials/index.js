'use strict';

import md from "angular-material";

export default angular.module('jmPartials', [md])

    .controller('jmPartialController', function (jmConstant) {
        let hasValidAddress = () => {
                let u = this.user;
                return (u && u.theState && (u.address && u.address.length > 5) && (u.city && u.city.length > 4)) ? true : false;
            },
            getAddress = () => window.encodeURIComponent(this.user.address + ',' + this.user.city + ',' + this.user.theState);

        this.states = jmConstant.states;
        this.addressDefined = () => hasValidAddress();
        this.getStreetViewURL = () => jmConstant.streetViewBase + getAddress() + jmConstant.streetViewSuffix;
        this.getGoogleMapsURL = () => jmConstant.googleMapsBase + getAddress();
    })

    .directive('jmAddress', () => {
        return {
            scope: {},
            bindToController: {
                user: '='
            },
            require: '^form',
            template: require('../partials/address.tpl.html'),
            controllerAs: 'jmPartialCtrl',
            controller: 'jmPartialController'
        };
    })

    .directive('jmSpouse', () => {
        return {
            scope: {},
            bindToController: {
                user: '='
            },
            require: '^form',
            template: require('../partials/spouse.tpl.html'),
            controllerAs: 'jmPartialCtrl',
            controller: 'jmPartialController'
        };
    })

    .directive('jmDatesAndPlaces', () => {
        return {
            scope: {},
            bindToController: {
                user: '='
            },
            require: '^form',
            template: require('../partials/datesAndPlaces.tpl.html'),
            controllerAs: 'jmPartialCtrl',
            controller: 'jmPartialController'
        };
    })

    .directive('jmRequired', () => {
        return {
            scope: {},
            bindToController: {
                user: '=',
                form: '='
            },
            require: '^form',
            template: require('../partials/required.tpl.html'),
            controllerAs: 'jmRequiredCtrl',
            controller: function (jmService, jmDB) {
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
                    init = async() => {
                        jmService.setRequiredForm(this.form);

                        try {
                            let response = await Promise.all([jmDB.queryParents('m'), jmDB.queryParents('f')]);
                            this.fathers = parents(response[0], 'm');
                            this.mothers = parents(response[1], 'f');
                        } catch (err) {
                        }
                    };

                this.update = () => init();

                this.names = this.user ? buildNames(angular.copy(this.user)) : undefined;

                init();
            }
        };
    })

    .directive('jmChildren', () => {
        return {
            scope: {},
            bindToController: {
                user: '='
            },
            require: '^form',
            template: require('../partials/children.tpl.html'),
            controllerAs: 'jmChildrenCtrl',
            controller: function ($scope) {
                this.fields = ['firstNameChild', 'middleNameChild', 'lastNameChild', 'bithdayChild', 'genderChild'];

                this.addChild = () => {
                    let lastOne = this.user.children.slice(-1).pop();
                    this.user.children.push(++lastOne);
                };

                this.removeChild = (index) => {
                    this.user.children.splice(this.user.children.indexOf(index), 1);
                    angular.forEach(this.fields, function (field) {
                        delete this.user[field + index];
                    });
                };

                $scope.$on('selectUser', (user) => {
                    if (user && !user.children) {
                        user.children = [0];
                    }
                });
            }
        };
    }).name;
