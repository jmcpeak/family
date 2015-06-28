'use strict';

angular.module('jmPartials', ['ngMaterial'])

    .service('jmService', function () {
        var card;
        var form;
        var outline;
        var previousForm;

        this.setRequiredForm = function (value) {
            previousForm = form;
            form = value;
        };

        this.getRequiredForm = function () {
            return form;
        };

        this.usePreviousForm = function () {
            form = previousForm;
        };

        this.resetPreviousCard = function () {
            if (card) {
                card.css('outline', outline);
            }
        };

        this.setSelectedCard = function (value) {
            card = value;
            outline = card.css('outline');
            card.css('outline', '4px auto -webkit-focus-ring-color');
        };
    })

    .controller('jmPartialController', function ($scope, $window, jmConstant) {
        var hasValidAddress = function (user) {
            user = user ? user : $scope.selectedUser;
            return (user && user.theState &&
            (user.address && user.address.length > 5) &&
            (user.city && user.city.length > 4)) ? true : false;
        };

        var getAddress = function (user) {
            user = user ? user : $scope.selectedUser;
            return $window.encodeURIComponent(user.address + ',' + user.city + ',' + user.theState);
        };

        $scope.states = jmConstant.states;

        $scope.addressDefined = function () {
            return hasValidAddress();
        };

        $scope.getStreetViewURL = function () {
            return jmConstant.streetViewBase + getAddress() + jmConstant.streetViewSuffix;
        };

        $scope.getGoogleMapsURL = function () {
            return jmConstant.googleMapsBase + getAddress();
        };
    })

    .directive('jmRequired', function (jmService, jmDB) {
        return {
            require: '^form',
            templateUrl: 'partials/required.tpl.html',
            controller: function ($scope) {
                var parents = function (resp, gender) {
                    var parents = [];
                    angular.forEach(resp, function (entry) {
                        if (entry.genderSpouse === gender) {
                            parents.push({id: entry.id, firstName: entry.firstNameSpouse, lastName: entry.lastNameSpouse});
                        } else {
                            parents.push({id: entry.id, firstName: entry.firstName, lastName: entry.lastName});
                        }
                    });
                    return parents;
                };

                var update = function () {
                    jmDB.queryFathers().then(function (resp) {
                        $scope.fathers = parents(resp, 'm');
                    });

                    jmDB.queryMothers().then(function (resp) {
                        $scope.mothers = parents(resp, 'f');
                    });
                }

                jmService.setRequiredForm($scope.userForm0);

                $scope.update = function () {
                    update();
                };

                update();
            }
        };
    })

    .directive('jmAddress', function () {
        return {
            require: '^form',
            templateUrl: 'partials/address.tpl.html',
            controller: 'jmPartialController'
        };
    })

    .directive('jmSpouse', function () {
        return {
            require: '^form',
            templateUrl: 'partials/spouse.tpl.html',
            controller: 'jmPartialController'
        };
    })

    .directive('jmDatesAndPlaces', function () {
        return {
            require: '^form',
            templateUrl: 'partials/datesAndPlaces.tpl.html',
            controller: 'jmPartialController'
        };
    })

    .directive('jmChildren', function () {
        return {
            require: '^form',
            templateUrl: 'partials/children.tpl.html',
            controller: function ($scope) {
                $scope.fields = ['firstNameChild', 'middleNameChild', 'bithdayChild', 'genderChild'];

                $scope.addChild = function () {
                    var lastOne = $scope.selectedUser.children.slice(-1).pop();
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
            }
        };
    });