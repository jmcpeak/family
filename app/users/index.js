'use strict';

import md from 'angular-material';
import template from '../users/index.tpl.html';

export default angular.module('jmUsers', [md])

    .controller('jmUsersController', function ($q, $sessionStorage, $localStorage, $state, jmDB) {
        this.count = '';
        this.busy = true;
        this.orderBy = this.orderBy ? this.orderBy : ['lastName', 'firstName'];

        this.select = (user) => {
            jmDB.addCachedItem(user);
            $localStorage.user = user;
            $state.go('user', {id: user.id})
        };

        this.$onInit = () => {
            if (!$sessionStorage.sessionToken)
                $state.go('login', {url: jmDB.setRedirect($state.current, $state.params)});
            else
                $q.all([jmDB.queryAll(), jmDB.getItem('lastUpdateDate')]).then((data) => {
                    this.users = data[0];
                    this.lastUpdate = data[1].lastUpdated;
                    this.lastUpdatedID = data[1].lastUpdatedID;
                    this.busy = false;
                }, (err) => {
                    this.busy = false;
                    this.queryAllError = err.message ? err.message : 'Unknown Error';
                });
        };
    })

    .component('jmUsers', {
        bindings: {
            filter: '=?',
            orderBy: '=?'
        },
        template: template,
        controller: 'jmUsersController'
    }).name;
