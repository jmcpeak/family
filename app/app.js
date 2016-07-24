'use strict';

import moment from 'moment';
import md from 'angular-material';
import aws from './aws';
import states from './states';
import login from './login';
import home from './home';
import users from './users';
import user from './user';
import 'ngstorage';
import 'angular-material/angular-material.min.css';

angular.module('app', [md, aws, states, login, home, users, user, 'ngStorage'])

    .constant('jmConstant', {
        light: 'golf',
        dark: 'golf-dark',
        googleMapsBase: 'https://www.google.com/maps/place/',
        streetViewBase: 'https://maps.googleapis.com/maps/api/streetview?location=',
        streetViewSuffix: '&size=450x250',
        genders: [
            {name: '', key: ''},
            {name: 'Male', key: 'm'},
            {name: 'Female', key: 'f'}],
        states: [
            {name: '', abbreviation: ''},
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
        ]
    })

    .config(($compileProvider, $httpProvider) => {
        $compileProvider.debugInfoEnabled(false);
        $httpProvider.useApplyAsync(true);
    })

    .config(($mdIconProvider, $mdDateLocaleProvider, $mdThemingProvider, jmConstant) => {
        $mdDateLocaleProvider.parseDate = (dateString) => moment(dateString).toDate();

        $mdIconProvider
            .iconSet('action', require('./assets/action-icons.svg'), 24)
            .iconSet('alert', require('./assets/alert-icons.svg'), 24)
            .iconSet('av', require('./assets/av-icons.svg'), 24)
            .iconSet('communication', require('./assets/communication-icons.svg'), 24)
            .iconSet('content', require('./assets/content-icons.svg'), 24)
            .iconSet('device', require('./assets/device-icons.svg'), 24)
            .iconSet('editor', require('./assets/editor-icons.svg'), 24)
            .iconSet('file', require('./assets/file-icons.svg'), 24)
            .iconSet('hardware', require('./assets/hardware-icons.svg'), 24)
            .iconSet('image', require('./assets/image-icons.svg'), 24)
            .iconSet('maps', require('./assets/maps-icons.svg'), 24)
            .iconSet('navigation', require('./assets/navigation-icons.svg'), 24)
            .iconSet('notification', require('./assets/notification-icons.svg'), 24)
            .iconSet('social', require('./assets/social-icons.svg'), 24)
            .iconSet('toggle', require('./assets/toggle-icons.svg'), 24);

        // Yeah, monkey patching, I know, but hey, it's my app
        // Add to string prototype
        String.prototype.hashCode = function () {
            let hash = 0, i, chr, len;
            if (this.length === 0) {
                return hash;
            }
            for (i = 0, len = this.length; i < len; i++) {
                /* jshint -W016 */
                chr = this.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        };

        $mdThemingProvider.alwaysWatchTheme(true);

        $mdThemingProvider.theme('default');

        $mdThemingProvider.theme(jmConstant.light, 'default')
            .primaryPalette('teal')
            .accentPalette('indigo');

        $mdThemingProvider.theme(jmConstant.dark, jmConstant.light)
            .primaryPalette('green')
            .accentPalette('indigo')
            .dark();

        $mdThemingProvider.theme('dark', 'default').dark();

        $mdThemingProvider.setDefaultTheme(jmConstant.light);
    })

    .service('jmThemeService', function ($timeout, $localStorage, jmConstant) {
        let theme = $localStorage.theme ? $localStorage.theme : jmConstant.light;

        this.get = () => theme;

        this.label = () => theme === jmConstant.light ? 'Dark Theme' : 'Light Theme';

        this.toggle = () => {
            theme = theme === jmConstant.light ? jmConstant.dark : jmConstant.light;
            $localStorage.theme = theme;
            return $timeout(() => this.label(), 400);
        };
    })

    .controller('themeController', function (jmThemeService) {
        this.get = () => jmThemeService.get();
    });
