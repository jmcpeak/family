'use strict';

angular.module('jmInput', ['ngMaterial', 'ngMessages'])

    .directive('jmInput', function () {
        return {
            scope: {
                label: '@',
                field: '@',
                ddisabled: '@',
                required: '@',
                type: '@',
                placeholder: '@',
                user: '='
            },
            require: ['^form'],
            templateUrl: 'input/input.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    })

    .directive('jmTextarea', function () {
        return {
            scope: {
                label: '@',
                field: '@',
                ddisabled: '@',
                required: '@',
                type: '@',
                placeholder: '@',
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
            scope: {
                field: '@',
                ddisabled: '@',
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
            scope: {
                field: '@',
                ddisabled: '@',
                user: '='
            },
            require: ['^form'],
            templateUrl: 'input/select.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    });
