'use strict';

angular.module('jmPartials', ['ngMaterial'])

    .service('jmService', function () {
        var form;
        var previousForm;
        var card;
        var outline;
        //var color;
        //var shadow;
        //var margin;

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
                card.css('outline', outline);
                //card.css('background-color', color);
                //card.css('box-shadow', shadow);
                //card.css('margin-right', margin);
            }
        };

        this.setSelectedCard = function (arg) {
            // save current values before modifying
            card = arg;
            outline = card.css('outline');
            //color = card.css('background-color');
            //shadow = card.css('box-shadow');
            //margin = card.css('margin-right');

            // modify
            card.css('outline', '4px auto -webkit-focus-ring-color');
            //card.css('box-shadow', 'none');
            //card.css('margin-right', '0');
        };
    })

    .controller('jmPartialController', function ($scope) {
        $scope.states = [
            {name: 'ALABAMA', abbreviation: 'AL'},
            {name: 'ALASKA', abbreviation: 'AK'},
            {name: 'AMERICAN SAMOA', abbreviation: 'AS'},
            {name: 'ARIZONA', abbreviation: 'AZ'},
            {name: 'ARKANSAS', abbreviation: 'AR'},
            {name: 'CALIFORNIA', abbreviation: 'CA'},
            {name: 'COLORADO', abbreviation: 'CO'},
            {name: 'CONNECTICUT', abbreviation: 'CT'},
            {name: 'DELAWARE', abbreviation: 'DE'},
            {name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
            {name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
            {name: 'FLORIDA', abbreviation: 'FL'},
            {name: 'GEORGIA', abbreviation: 'GA'},
            {name: 'GUAM', abbreviation: 'GU'},
            {name: 'HAWAII', abbreviation: 'HI'},
            {name: 'IDAHO', abbreviation: 'ID'},
            {name: 'ILLINOIS', abbreviation: 'IL'},
            {name: 'INDIANA', abbreviation: 'IN'},
            {name: 'IOWA', abbreviation: 'IA'},
            {name: 'KANSAS', abbreviation: 'KS'},
            {name: 'KENTUCKY', abbreviation: 'KY'},
            {name: 'LOUISIANA', abbreviation: 'LA'},
            {name: 'MAINE', abbreviation: 'ME'},
            {name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
            {name: 'MARYLAND', abbreviation: 'MD'},
            {name: 'MASSACHUSETTS', abbreviation: 'MA'},
            {name: 'MICHIGAN', abbreviation: 'MI'},
            {name: 'MINNESOTA', abbreviation: 'MN'},
            {name: 'MISSISSIPPI', abbreviation: 'MS'},
            {name: 'MISSOURI', abbreviation: 'MO'},
            {name: 'MONTANA', abbreviation: 'MT'},
            {name: 'NEBRASKA', abbreviation: 'NE'},
            {name: 'NEVADA', abbreviation: 'NV'},
            {name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
            {name: 'NEW JERSEY', abbreviation: 'NJ'},
            {name: 'NEW MEXICO', abbreviation: 'NM'},
            {name: 'NEW YORK', abbreviation: 'NY'},
            {name: 'NORTH CAROLINA', abbreviation: 'NC'},
            {name: 'NORTH DAKOTA', abbreviation: 'ND'},
            {name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
            {name: 'OHIO', abbreviation: 'OH'},
            {name: 'OKLAHOMA', abbreviation: 'OK'},
            {name: 'OREGON', abbreviation: 'OR'},
            {name: 'PALAU', abbreviation: 'PW'},
            {name: 'PENNSYLVANIA', abbreviation: 'PA'},
            {name: 'PUERTO RICO', abbreviation: 'PR'},
            {name: 'RHODE ISLAND', abbreviation: 'RI'},
            {name: 'SOUTH CAROLINA', abbreviation: 'SC'},
            {name: 'SOUTH DAKOTA', abbreviation: 'SD'},
            {name: 'TENNESSEE', abbreviation: 'TN'},
            {name: 'TEXAS', abbreviation: 'TX'},
            {name: 'UTAH', abbreviation: 'UT'},
            {name: 'VERMONT', abbreviation: 'VT'},
            {name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
            {name: 'VIRGINIA', abbreviation: 'VA'},
            {name: 'WASHINGTON', abbreviation: 'WA'},
            {name: 'WEST VIRGINIA', abbreviation: 'WV'},
            {name: 'WISCONSIN', abbreviation: 'WI'},
            {name: 'WYOMING', abbreviation: 'WY'}
        ];
    })

    .directive('jmRequired', function (jmService, jmDB) {
        return {
            require: '^form',
            templateUrl: 'partials/required.tpl.html',
            controller: function ($scope) {
                jmService.setRequiredForm($scope.userForm0);

                var update = function () {
                    jmDB.queryFathers().then(function (resp) {
                        $scope.fathers = resp;
                    });

                    jmDB.queryMothers().then(function (resp) {
                        $scope.mothers = resp;
                    });
                };

                $scope.states = [
                    {name: 'ALABAMA', abbreviation: 'AL'},
                    {name: 'ALASKA', abbreviation: 'AK'},
                    {name: 'AMERICAN SAMOA', abbreviation: 'AS'},
                    {name: 'ARIZONA', abbreviation: 'AZ'},
                    {name: 'ARKANSAS', abbreviation: 'AR'},
                    {name: 'CALIFORNIA', abbreviation: 'CA'},
                    {name: 'COLORADO', abbreviation: 'CO'},
                    {name: 'CONNECTICUT', abbreviation: 'CT'},
                    {name: 'DELAWARE', abbreviation: 'DE'},
                    {name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
                    {name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
                    {name: 'FLORIDA', abbreviation: 'FL'},
                    {name: 'GEORGIA', abbreviation: 'GA'},
                    {name: 'GUAM', abbreviation: 'GU'},
                    {name: 'HAWAII', abbreviation: 'HI'},
                    {name: 'IDAHO', abbreviation: 'ID'},
                    {name: 'ILLINOIS', abbreviation: 'IL'},
                    {name: 'INDIANA', abbreviation: 'IN'},
                    {name: 'IOWA', abbreviation: 'IA'},
                    {name: 'KANSAS', abbreviation: 'KS'},
                    {name: 'KENTUCKY', abbreviation: 'KY'},
                    {name: 'LOUISIANA', abbreviation: 'LA'},
                    {name: 'MAINE', abbreviation: 'ME'},
                    {name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
                    {name: 'MARYLAND', abbreviation: 'MD'},
                    {name: 'MASSACHUSETTS', abbreviation: 'MA'},
                    {name: 'MICHIGAN', abbreviation: 'MI'},
                    {name: 'MINNESOTA', abbreviation: 'MN'},
                    {name: 'MISSISSIPPI', abbreviation: 'MS'},
                    {name: 'MISSOURI', abbreviation: 'MO'},
                    {name: 'MONTANA', abbreviation: 'MT'},
                    {name: 'NEBRASKA', abbreviation: 'NE'},
                    {name: 'NEVADA', abbreviation: 'NV'},
                    {name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
                    {name: 'NEW JERSEY', abbreviation: 'NJ'},
                    {name: 'NEW MEXICO', abbreviation: 'NM'},
                    {name: 'NEW YORK', abbreviation: 'NY'},
                    {name: 'NORTH CAROLINA', abbreviation: 'NC'},
                    {name: 'NORTH DAKOTA', abbreviation: 'ND'},
                    {name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
                    {name: 'OHIO', abbreviation: 'OH'},
                    {name: 'OKLAHOMA', abbreviation: 'OK'},
                    {name: 'OREGON', abbreviation: 'OR'},
                    {name: 'PALAU', abbreviation: 'PW'},
                    {name: 'PENNSYLVANIA', abbreviation: 'PA'},
                    {name: 'PUERTO RICO', abbreviation: 'PR'},
                    {name: 'RHODE ISLAND', abbreviation: 'RI'},
                    {name: 'SOUTH CAROLINA', abbreviation: 'SC'},
                    {name: 'SOUTH DAKOTA', abbreviation: 'SD'},
                    {name: 'TENNESSEE', abbreviation: 'TN'},
                    {name: 'TEXAS', abbreviation: 'TX'},
                    {name: 'UTAH', abbreviation: 'UT'},
                    {name: 'VERMONT', abbreviation: 'VT'},
                    {name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
                    {name: 'VIRGINIA', abbreviation: 'VA'},
                    {name: 'WASHINGTON', abbreviation: 'WA'},
                    {name: 'WEST VIRGINIA', abbreviation: 'WV'},
                    {name: 'WISCONSIN', abbreviation: 'WI'},
                    {name: 'WYOMING', abbreviation: 'WY'}
                ];

                $scope.update = function () {
                    update();
                };

                update();
            }
        };
    })

    .directive('jmAdditional', function () {
        return {
            require: '^form',
            templateUrl: 'partials/additional.tpl.html',
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