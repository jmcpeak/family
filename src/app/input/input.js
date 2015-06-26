'use strict';

angular.module('jmInput', ['ngMaterial', 'ngMessages'])

    .directive('jmInput', function () {
        return {
            scope: {
                label: '@',
                field: '@',
                required: '@',
                type: '@',
                placeholder: '@',
                focus: '=',
                user: '='
            },
            require: ['^form'],
            templateUrl: 'input/input.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];

                scope.$on('selectUser', function(event) {
                    if (event.currentScope.focus) {
                        element.find('input').focus();
                    }
                });
            }
        };
    })

    .directive('jmTextArea', function () {
        return {
            scope: {
                label: '@',
                field: '@',
                placeholder: '@',
                user: '='
            },
            replace: true,
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
                placeholder: '@',
                field: '@',
                keyvalue: '@',
                keydisplay: '@',
                user: '=',
                repeat: '='
            },
            require: ['^form'],
            templateUrl: 'input/select.tpl.html',
            link: function (scope, element, attrs, controls) {
                scope.form = controls[0];
            }
        };
    });
