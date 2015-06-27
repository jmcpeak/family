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

    .controller('jmPartialController', function ($scope, jmConstant) {
        $scope.states = jmConstant.states;
    })

    .directive('jmRequired', function (jmService, jmDB) {
        return {
            require: '^form',
            templateUrl: 'partials/required.tpl.html',
            controller: function ($scope) {
                jmService.setRequiredForm($scope.userForm0);

                $scope.update = function () {
                    jmDB.queryFathers().then(function (resp) {
                        $scope.fathers = resp;
                    });

                    jmDB.queryMothers().then(function (resp) {
                        $scope.mothers = resp;
                    });
                };
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