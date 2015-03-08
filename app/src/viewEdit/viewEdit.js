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
            templateUrl: 'src/viewEdit/input.tpl.html',
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
            templateUrl: 'src/viewEdit/switch.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    });
