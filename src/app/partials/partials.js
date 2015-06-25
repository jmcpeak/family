'use strict';

angular.module('jmPartials', ['ngMaterial'])

    .service('jmService', function () {
        var form;
        var card;
        var color;
        var shadow;
        var margin;

        this.setRequiredForm = function (reqForm) {
            form = reqForm;
        };

        this.getRequiredForm = function () {
            return form;
        };

        this.resetPreviousCard = function () {
            if (card) {
                card.css('background-color', color);
                card.css('box-shadow', shadow);
                card.css('margin-right', margin);
            }
        };

        this.setSelectedCard = function (arg) {
            // save current values before modifying
            card = arg;
            color = card.css('background-color');
            shadow = card.css('box-shadow');
            margin = card.css('margin-right');

            // modify
            card.css('background-color', 'rgb(238,255,238)');
            card.css('box-shadow', 'none');
            card.css('margin-right', '0');
        };
    })

    .directive('jmRequired', function (jmService) {
        return {
            require: '^form',
            templateUrl: 'partials/required.tpl.html',
            controller: function ($scope) {
                jmService.setRequiredForm($scope.userForm0);
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