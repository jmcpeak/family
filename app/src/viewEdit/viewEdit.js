angular.module('jmViewEdit', [])

    .directive("jmViewEdit", function () {
        return {
            scope: true,
            templateUrl: 'src/viewEdit/viewEdit.tpl.html',
            controller: function () {
            }
        };
    });
