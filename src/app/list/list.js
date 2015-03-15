'use strict';

angular.module('jmList', ['ngMaterial', 'jmUser', 'jmViewEdit'])

    .directive("jmList", function () {
        return {
            templateUrl: 'list/list.tpl.html',
            controller: 'jmListController'
        };
    })

    .directive("jmToolbar", function () {
        return {
            replace: true,
            templateUrl: 'list/toolbar.tpl.html',
            controller: 'jmListController'
        };
    })

    .controller("jmListController", function ($scope, $mdDialog, $mdSidenav, jmDB) {
        var promise = jmDB.queryAll();

        promise.then(function (users) {
            $scope.count = users.length;
            for (var i in users) {
                $scope.users.push({
                    id: users[i].id,
                    //face: '',
                    who: users[i].firstName + ' ' + users[i].lastName,
                    where: users[i].address,
                    email: users[i].email,
                    initials: users[i].firstName[0] + users[i].lastName[0]
                });
            }
        }, function (reason) {
            window.alert('Failed: ' + reason);
        });

        $scope.users = [];
        $scope.count = '';
        $scope.lastUpdate = new Date();
        $scope.name = 'McPeak';

        $scope.height = 'auto';

        $scope.showUser = function (event, user) {

            $mdDialog.show({
                controller: 'jmUserController',
                templateUrl: 'user/user.tpl.html',
                targetEvent: event,
                locals: user
            });
            //.then(function (answer) {
            //    $scope.alert = 'You said the information was "' + answer + '".';
            //}, function () {
            //    $scope.alert = 'You cancelled the dialog.';
            //});
        };

        $scope.open = function () {
            $mdSidenav('left').open();
        };

        $scope.close = function () {
            $mdSidenav('left').close();
        };

        $scope.showDelete = false;

        $scope.menus = [
            {link: 'https://github.com/jmcpeak/family/issues', label: 'issues'},
            {link: 'https://github.com/jmcpeak/family', label: 'Code'},
            {link: 'https://travis-ci.org/jmcpeak/family', label: 'Builds'}
        ];

        $scope.add = function (event) {
            $mdDialog.show({
                template: '<md-dialog aria-label="Add" style="width: 30%; height: 30%;"><md-content layout-padding flex>Add User</md-content></md-dialog>',
                targetEvent: event
            });
        };

    });
