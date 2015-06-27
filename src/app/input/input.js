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
            replace: true,
            scope: {
                label: '@',
                field: '@',
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
            //replace: true,
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
            replace: true,
            scope: {
                placeholder: '@',
                field: '@',
                keyvalue: '@',
                keydisplay: '@',
                keydisplay2: '@',
                required: '=',
                user: '=',
                repeat: '=',
                orderclause: '@'
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
    });
