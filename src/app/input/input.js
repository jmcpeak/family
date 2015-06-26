'use strict';

angular.module('jmInput', ['ngMaterial', 'ngMessages'])

    .directive('jmInput', function ($timeout) {
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
                var previous;
                scope.form = controls[0];

                if (scope.focus) {
                    $timeout(function () {
                        element.find('input').focus();
                    });
                }

                scope.$on('selectUser', function(event, user) {
                    if (event.currentScope.focus) {
                        element.find('input').focus();
                    }
                });
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
