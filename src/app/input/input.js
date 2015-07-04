'use strict';

angular.module('jmInput', ['ngMaterial', 'ngMessages'])

    .directive('jmInput', function () {
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
            templateUrl: 'input/input.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];

                scope.$on('selectUser', function (event) {
                    if (event.currentScope.focus) {
                        element.find('input').focus();
                    }
                });
            }
        };
    })

    .directive('jmTextArea', function () {
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
            templateUrl: 'input/textarea.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    })

    .directive('jmSwitch', function () {
        return {
            //replace: true,
            scope: {
                field: '@',
                ddisabled: '@',
                taborder: '@',
                user: '='
            },
            require: ['^form'],
            templateUrl: 'input/switch.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    })

    .directive('jmSelect', function () {
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
            templateUrl: 'input/select.tpl.html',
            controller: function ($scope) {
                $scope.selection = function (value) {
                    if ($scope.keydisplay && $scope.keydisplay2) {
                        return value[$scope.keydisplay] + ' ' + value[$scope.keydisplay2];
                    } else if ($scope.keydisplay) {
                        return value[$scope.keydisplay];
                    } else {
                        return value;
                    }
                };
            },
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    })

    .directive('jmDuration', function () {
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
            templateUrl: 'input/duration.tpl.html',
            controller: function ($scope) {

                $scope.duration = function () {
                    if ($scope.user) {
                        var from = $scope.from ? moment($scope.user[$scope.from]) : false;
                        var to = $scope.to ? moment($scope.user[$scope.to]) : moment();
                        var split = $scope.split ? $scope.split.split(',') : undefined;

                        if (split && split.length > 1) {
                            var dateOne = moment($scope.user[split[0]]);
                            var dateTwo = moment($scope.user[split[1]]);
                            to = moment(dateOne).isBefore(dateTwo) ? dateOne : dateTwo;
                        }

                        var retVal = (moment.isMoment(from) && moment.isMoment(to)) && !moment(from).isSame(to, 'second') ? moment.duration(from - to).humanize() : '';



                        $scope.hasValue = retVal.length ? true : false;

                        return retVal;
                    }
                };
            }
        };
    });
