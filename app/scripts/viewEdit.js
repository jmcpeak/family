angular.module('viewEdit', [])

    .directive("jmViewEdit", function () {
        return {
            scope: true,
            templateUrl: 'views/viewEdit.tpl.html',
            controller: function () {
            }
        };
    });
