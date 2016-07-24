'use strict';

import md from 'angular-material';
import route from 'angular-route';
import messages from 'angular-messages';
import loginTemplate from '../login/index.tpl.html';
import 'ngstorage';

export default angular.module('jmLogin', [md, messages, route, 'ngStorage'])

    .controller('jmLoginController', function ($element, $timeout, $state, $sessionStorage, $localStorage, jmDB) {
        let goHome = () => $state.go('home', $localStorage.user ? {id: $localStorage.user.id} : undefined);
        this.messages = {};
        this.busy = false;

        this.clear = () => {
            this.busy = false;
            this.messages.password = false;
            this.messages.amazon = false;
        };

        this.login = () => {
            if (this.city.toLowerCase().hashCode() === 463258776) {
                this.busy = true;

                AWS.config.credentials.get((error) => {
                    if (!error) {
                        $sessionStorage.sessionToken = AWS.config.credentials.sessionToken;

                        if ($state.params.url) {
                            let redirect = jmDB.getRedirect($state.params.url);
                            $state.go(redirect.state, redirect.params);
                        } else
                            goHome();
                    } else {
                        this.messages.amazon = true;
                        this.error = (error.message) ? error.message : 'Unknown Error'
                    }
                });
            } else
                this.messages.password = true;
        };

        this.$onInit = () => {
            if ($sessionStorage.sessionToken)
                goHome();

            $timeout(() => $element.find('input').focus(), 50);
        };
    })

    .component('jmLogin', {
        template: loginTemplate,
        controller: 'jmLoginController'
    }).name;
