'use strict';

angular.module('jmPartials', ['ngMaterial'])

    .service('jmService', function () {
        var form;
        var previousForm;
        var card;
        var color;
        var shadow;
        var margin;

        this.setRequiredForm = function (reqForm) {
            previousForm = form;
            form = reqForm;
        };

        this.getRequiredForm = function () {
            return form;
        };

        this.usePreviousForm = function () {
            form = previousForm;
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
                $scope.states = [
                    { name: 'ALABAMA', abbreviation: 'AL'},
                    { name: 'ALASKA', abbreviation: 'AK'},
                    { name: 'AMERICAN SAMOA', abbreviation: 'AS'},
                    { name: 'ARIZONA', abbreviation: 'AZ'},
                    { name: 'ARKANSAS', abbreviation: 'AR'},
                    { name: 'CALIFORNIA', abbreviation: 'CA'},
                    { name: 'COLORADO', abbreviation: 'CO'},
                    { name: 'CONNECTICUT', abbreviation: 'CT'},
                    { name: 'DELAWARE', abbreviation: 'DE'},
                    { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
                    { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
                    { name: 'FLORIDA', abbreviation: 'FL'},
                    { name: 'GEORGIA', abbreviation: 'GA'},
                    { name: 'GUAM', abbreviation: 'GU'},
                    { name: 'HAWAII', abbreviation: 'HI'},
                    { name: 'IDAHO', abbreviation: 'ID'},
                    { name: 'ILLINOIS', abbreviation: 'IL'},
                    { name: 'INDIANA', abbreviation: 'IN'},
                    { name: 'IOWA', abbreviation: 'IA'},
                    { name: 'KANSAS', abbreviation: 'KS'},
                    { name: 'KENTUCKY', abbreviation: 'KY'},
                    { name: 'LOUISIANA', abbreviation: 'LA'},
                    { name: 'MAINE', abbreviation: 'ME'},
                    { name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
                    { name: 'MARYLAND', abbreviation: 'MD'},
                    { name: 'MASSACHUSETTS', abbreviation: 'MA'},
                    { name: 'MICHIGAN', abbreviation: 'MI'},
                    { name: 'MINNESOTA', abbreviation: 'MN'},
                    { name: 'MISSISSIPPI', abbreviation: 'MS'},
                    { name: 'MISSOURI', abbreviation: 'MO'},
                    { name: 'MONTANA', abbreviation: 'MT'},
                    { name: 'NEBRASKA', abbreviation: 'NE'},
                    { name: 'NEVADA', abbreviation: 'NV'},
                    { name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
                    { name: 'NEW JERSEY', abbreviation: 'NJ'},
                    { name: 'NEW MEXICO', abbreviation: 'NM'},
                    { name: 'NEW YORK', abbreviation: 'NY'},
                    { name: 'NORTH CAROLINA', abbreviation: 'NC'},
                    { name: 'NORTH DAKOTA', abbreviation: 'ND'},
                    { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
                    { name: 'OHIO', abbreviation: 'OH'},
                    { name: 'OKLAHOMA', abbreviation: 'OK'},
                    { name: 'OREGON', abbreviation: 'OR'},
                    { name: 'PALAU', abbreviation: 'PW'},
                    { name: 'PENNSYLVANIA', abbreviation: 'PA'},
                    { name: 'PUERTO RICO', abbreviation: 'PR'},
                    { name: 'RHODE ISLAND', abbreviation: 'RI'},
                    { name: 'SOUTH CAROLINA', abbreviation: 'SC'},
                    { name: 'SOUTH DAKOTA', abbreviation: 'SD'},
                    { name: 'TENNESSEE', abbreviation: 'TN'},
                    { name: 'TEXAS', abbreviation: 'TX'},
                    { name: 'UTAH', abbreviation: 'UT'},
                    { name: 'VERMONT', abbreviation: 'VT'},
                    { name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
                    { name: 'VIRGINIA', abbreviation: 'VA'},
                    { name: 'WASHINGTON', abbreviation: 'WA'},
                    { name: 'WEST VIRGINIA', abbreviation: 'WV'},
                    { name: 'WISCONSIN', abbreviation: 'WI'},
                    { name: 'WYOMING', abbreviation: 'WY' }
                ];
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