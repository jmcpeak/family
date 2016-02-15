'use strict';

/* jshint -W079 */
let moment = require('moment');

export default angular.module('jmInput', [
        require('angular-material'),
        require('angular-messages')])

    .directive('jmInput', () => {
        return {
            replace: true,
            scope: {
                label: '@',
                field: '@',
                required: '@',
                type: '@',
                placeholder: '@',
                taborder: '@',
                focus: '=',
                user: '='
            },
            require: ['^form'],
            template: require('../input/input.tpl.html'),
            link: (scope, element, attrs, controls) => {
                scope.form = controls[0];

                scope.$on('selectUser', (event) => {
                    if (event.currentScope.focus) {
                        element.find('input').focus();
                    }
                });
            }
        };
    })

    .directive('jmTextArea', () => {
        return {
            replace: true,
            scope: {
                label: '@',
                field: '@',
                placeholder: '@',
                taborder: '@',
                user: '='
            },
            require: ['^form'],
            template: require('../input/textarea.tpl.html'),
            link: (scope, element, attrs, controls) => scope.form = controls[0]
        };
    })

    .directive('jmSwitch', () => {
        return {
            scope: {
                field: '@',
                ddisabled: '@',
                taborder: '@',
                user: '='
            },
            require: ['^form'],
            template: require('../input/switch.tpl.html'),
            link: (scope, element, attrs, controls) => scope.form = controls[0]
        };
    })

    .directive('jmSelect', () => {
        return {
            replace: true,
            scope: {
                placeholder: '@',
                field: '@',
                keyvalue: '@',
                keydisplay: '@',
                keydisplay2: '@',
                orderclause: '@',
                taborder: '@',
                required: '=',
                user: '=',
                repeat: '='
            },
            require: ['^form'],
            template: require('../input/select.tpl.html'),
            controller: function ($scope) {
                $scope.selection = (value) => {
                    if ($scope.keydisplay && $scope.keydisplay2) {
                        return value[$scope.keydisplay] + ' ' + value[$scope.keydisplay2];
                    } else if ($scope.keydisplay) {
                        return value[$scope.keydisplay];
                    } else {
                        return value;
                    }
                };
            },
            link: (scope, element, attrs, controls) => scope.form = controls[0]
        };
    })

    .directive('jmDuration', () => {
        return {
            replace: true,
            scope: {
                user: '=',
                from: '@',
                to: '@',
                split: '@',
                prefix: '@',
                suffix: '@'
            },
            template: require('../input/duration.tpl.html'),
            controller: function ($scope) {
                $scope.duration = () => {
                    if ($scope.user) {
                        let from = $scope.from && $scope.user[$scope.from] ? moment(new Date($scope.user[$scope.from])) : false,
                            to = $scope.to ? moment($scope.user[$scope.to]) : moment(),
                            split = $scope.split ? $scope.split.split(',') : undefined;

                        if (split && split.length > 1) {
                            let dateOne = moment($scope.user[split[0]]),
                                dateTwo = moment($scope.user[split[1]]);
                            to = moment(dateOne).isBefore(dateTwo) ? dateOne : dateTwo;
                        }

                        let years = Math.floor(moment.duration(to - from).asYears());

                        if (years === 0) {
                            years = 'less than a year';
                        } else if (years === 1) {
                            years = years + ' year';
                        } else {
                            years = years + ' years';
                        }

                        let retVal = (moment.isMoment(from) && moment.isMoment(to)) && !moment(from).isSame(to, 'second') ? years : '';

                        $scope.hasValue = retVal.length ? true : false;

                        return retVal;
                    }
                };
            }
        };
    }).name;
