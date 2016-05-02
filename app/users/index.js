'use strict';

import md from 'angular-material';
import index from '../users/index.tpl.html';

export default angular.module('jmUsers', [md])

    .controller('jmUsersController', function ($document, $q, $timeout, $localStorage, jmDB, jmConstant) {
        this.count = '';
        this.queryAllInProgress = true;
        this.orderBy = this.orderBy ? this.orderBy : ['lastName', 'firstName'];

        // used in user.index.js
        this.refresh = (user) => {
            if (user) {
                //this.selectUser(user);
                let element = $document.find(jmConstant.userIdHash + user.id);
                if (element.length)
                    $timeout(() => element.click()[0].scrollIntoView(false), 200);
            }
        };

        this.$onInit = () => {
            $q.all([jmDB.queryAll(), jmDB.getItem('lastUpdateDate')]).then((data) => {
                this.users = data[0];
                this.lastUpdate = data[1].lastUpdated;
                this.lastUpdatedID = data[1].lastUpdatedID;
                this.refresh($localStorage.user);
                this.queryAllInProgress = false;
            }, (err) => {
                this.queryAllInProgress = false;
                this.queryAllError = err.message ? err.message : 'Unknown Error';
            });
        };
    })

    .component('jmUsers', {
        bindings: {
            filter: '=?',
            orderBy: '=?'
        },
        template: index,
        controller: 'jmUsersController'
    }).name;
