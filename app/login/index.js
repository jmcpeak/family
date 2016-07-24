'use strict';

import md from 'angular-material';
import route from 'angular-route';
import messages from 'angular-messages';
import loginTemplate from '../login/index.tpl.html';
import 'ngstorage';

export default angular.module('jmLogin', [md, messages, route, 'ngStorage'])

    .controller('jmLoginController', function ($element, $timeout, $state, $sessionStorage, $localStorage) {
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
                        $state.go('home', {id: $localStorage.user.id});
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
                $state.go('home', {id: $localStorage.user.id});

            $timeout(() => $element.find('input').focus(), 50);
        };
    })

    .component('jmLogin', {
        template: loginTemplate,
        controller: 'jmLoginController'
    }).name;
