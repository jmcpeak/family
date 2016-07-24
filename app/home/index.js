'use strict';

import md from 'angular-material';
import uiRouter from 'angular-ui-router';
import template from '../home/index.tpl.html';
import input from '../input';
import toolbar from '../toolbar';
import user from '../user';
import users from '../users';
import 'ngstorage';

export default angular.module('jmHome', [md, uiRouter, input, toolbar, users, user, 'ngStorage'])

    .controller('jmHomeController', function ($timeout, $state, $sessionStorage, jmDB) {
        this.filter = '';

        this.$onInit = () => {
            if (!$sessionStorage.sessionToken)
                $state.go('login', {url: jmDB.setRedirect($state.current, $state.params)});

            $timeout(()=> {
                //angular.element(jmConstant.userIdHash + $localStorage.user.id).click()[0].scrollIntoView(false);
            });
        };
    })

    .component('jmHome', {
        template: template,
        controller: 'jmHomeController'
    }).name;
