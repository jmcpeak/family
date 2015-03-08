'use strict';

angular.module('jmFamily', ['ngAnimate', 'ngCookies', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch', 'ngMaterial',
    'ngMessages', 'jmViewEdit', 'jmList'])

    .config(function ($routeProvider, $mdThemingProvider) {

        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        // Update the theme colors to use themes on font-icons
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('blue')
            .warnPalette('pink');//.backgroundPalette('light-green');

        // Configure a dark theme with primary foreground yellow
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('green')
            .accentPalette('blue')
            .warnPalette('pink')
            .dark();
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
