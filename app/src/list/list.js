'use strict';

angular.module('jmList', ['ngMaterial', 'jmUser', 'jmViewEdit', 'jmDB'])

    .directive("jmList", function () {
        return {
            scope: true,
            templateUrl: 'src/list/list.tpl.html',
            controller: function ($scope, $mdDialog, jmDB) {
                var promise = jmDB.queryAll();

                promise.then(function (users) {
                    $scope.count = users.length;
                    for (var i in users) {
                        var name = users[i].firstName + ' ' + users[i].lastName;
                        $scope.users.push({
                            id: users[i].id,
                            face: 'images/cat.jpeg',
                            who: name,
                            where: users[i].address,
                            email: users[i].email
                        });
                    }
                }, function (reason) {
                    window.alert('Failed: ' + reason);
                });

                $scope.users = [];
                $scope.count = '';
                $scope.lastUpdate = new Date();

                $scope.showUser = function (event, user) {

                    $mdDialog.show({
                        controller: 'jmUserController',
                        templateUrl: 'src/user/user.tpl.html',
                        targetEvent: event,
                        locals: user
                    });
                    //.then(function (answer) {
                    //    $scope.alert = 'You said the information was "' + answer + '".';
                    //}, function () {
                    //    $scope.alert = 'You cancelled the dialog.';
                    //});
                };
            }
        };
    });
