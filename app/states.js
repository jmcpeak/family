'use strict';

import md from 'angular-material';
import route from 'angular-route';
import uiRouter from 'angular-ui-router';

export default angular.module('jmStates', [md, route, uiRouter])

    .config(function ($injector, $locationProvider, $urlRouterProvider, $stateProvider) {

        //$locationProvider.html5Mode(true);
        $urlRouterProvider.otherwise(($injector) => $injector.get('$state').go('login'));

        $stateProvider.state('login', {
            url: '/login',
            template: '<jm-login></jm-login>'
        });

        $stateProvider.state('home', {
            url: '/home' + '/:user',
            template: '<jm-home></jm-home>'
        });

    }).name;
