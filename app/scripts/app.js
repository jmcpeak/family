'use strict';

angular.module('jmFamily', ['ngAnimate', 'ngCookies', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch', 'ngMaterial',
    'ngMessages', 'jmViewEdit', 'jmList'])

    .config(function ($routeProvider, $mdThemingProvider) {

        $routeProvider
            .when('/', {
                templateUrl: 'src/views/main.html',
                controller: 'jmPartialController'
            })
            .when('/required', {
                templateUrl: 'src/partials/required.tpl.html',
                controller: 'jmPartialController'
            })
            .when('/spouse', {
                templateUrl: 'src/partials/spouse.tpl.html',
                controller: 'jmPartialController'
            })
            .when('/additional', {
                templateUrl: 'src/partials/additional.tpl.html',
                controller: 'jmPartialController'
            })
            .when('/datesAndPlaces', {
                templateUrl: 'src/partials/datesAndPlaces.tpl.html',
                controller: 'jmPartialController'
            })
            .when('/children', {
                templateUrl: 'src/partials/children.tpl.html',
                controller: 'jmPartialController'
            })

            .otherwise({
                redirectTo: '/'
            });

        // Update the theme colors to use themes on font-icons
        // red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime,
        // yellow, amber, orange, deep-orange, brown, grey, blue-grey no more
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('blue')
            .warnPalette('pink');
            //.backgroundPalette('teal');

        // Configure a dark theme with primary foreground yellow
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('green')
            .accentPalette('blue')
            .warnPalette('pink')
            .dark();
    })

    .controller("jmPartialController", function ($scope) {

    })

    .directive("jmFloatingDesktopButtons", function () {
        return {
            scope: true,
            templateUrl: 'scripts/floatingButtons.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .directive("jmFloatingMobileAddButton", function () {
        return {
            scope: true,
            templateUrl: 'scripts/floatingMobileButton.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .directive("jmFloatingMobileDeleteButton", function () {
        return {
            scope: true,
            templateUrl: 'scripts/floatingMobileDeleteButton.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .directive("jmFloatingDesktopDeleteButton", function () {
        return {
            scope: true,
            templateUrl: 'scripts/floatingDesktopDeleteButton.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .controller("jmFloatingButtonController", function ($scope) {

        $scope.items = [
            {name: 'Share', icon: 'share'},
            {name: 'Upload', icon: 'upload'},
            {name: 'Copy', icon: 'copy'},
            {name: 'Print this page', icon: 'print'}
        ];

        $scope.getAdd = function () {
            return 'bower_components/material-design-icons/content/svg/production/ic_add_24px.svg';
        };

        $scope.getEmail = function () {
            return 'bower_components/material-design-icons/communication/svg/production/ic_email_24px.svg';
        };

        $scope.getPrint = function () {
            return 'bower_components/material-design-icons/action/svg/production/ic_print_24px.svg';
        };

        $scope.getRemove = function () {
            return 'bower_components/material-design-icons/action/svg/production/ic_delete_24px.svg';
        };
    });
