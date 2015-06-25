'use strict';

angular.module('jmPartials', ['ngMaterial'])

    .service('jmFormService', function () {
        var form;

        this.setRequiredForm = function (reqForm) {
            form = reqForm;
        };

        this.getRequiredForm = function () {
            return form;
        };
    })

    .directive('jmRequired', function (jmFormService) {
        return {
            require: '^form',
            templateUrl: 'partials/required.tpl.html',
            controller: function ($scope) {
                jmFormService.setRequiredForm($scope.userForm0);
            }
        };
    })

    .directive('jmAdditional', function () {
        return {
            require: '^form',
            templateUrl: 'partials/additional.tpl.html'
        };
    })

    .directive('jmSpouse', function () {
        return {
            require: '^form',
            templateUrl: 'partials/spouse.tpl.html'
        };
    })

    .directive('jmDatesAndPlaces', function () {
        return {
            require: '^form',
            templateUrl: 'partials/datesAndPlaces.tpl.html'
        };
    })

    .directive('jmChildren', function () {
        return {
            require: '^form',
            templateUrl: 'partials/children.tpl.html'
        };
    });