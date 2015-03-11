'use strict';

angular.module('jmViewEdit', ['ngMaterial'])

    .directive("jmInput", function () {
        return {
            scope: {
                label: '@',
                field: '@',
                disabled: '@',
                required: '@',
                type: '@',
                placeholder: '@',
                user: '='
            },
            require: ['^form'],
            templateUrl: 'viewEdit/input.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    })

    .directive("jmTextarea", function () {
        return {
            scope: {
                label: '@',
                field: '@',
                disabled: '@',
                required: '@',
                type: '@',
                placeholder: '@',
                user: '='
            },
            require: ['^form'],
            templateUrl: 'viewEdit/textarea.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    })

    .directive("jmSwitch", function () {
        return {
            scope: {
                field: '@',
                disabled: '@',
                user: '='
            },
            require: ['^form'],
            templateUrl: 'viewEdit/switch.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    })

    .directive("jmSelect", function () {
        return {
            scope: {
                field: '@',
                disabled: '@',
                user: '='
            },
            require: ['^form'],
            templateUrl: 'viewEdit/select.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    });
