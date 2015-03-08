'use strict';

angular.module('jmList', ['ngMaterial', 'jmUser'])

    .directive("jmList", function () {
        return {
            scope: true,
            templateUrl: 'src/list/list.tpl.html',
            controller: function ($scope, $mdDialog, $mdBottomSheet, jmDB) {
                $scope.name = 'McPeak';

                $scope.lastUpdate = new Date();

                $scope.count = '100';

                $scope.users = [];

                var promise = jmDB.queryMain();

                promise.then(function (users) {
                    for (var i in users) {
                        var name = users[i].firstName + ' ' + users[i].lastName;
                        $scope.users.push({
                            face: 'images/yeoman.png',
                            who: name,
                            where: users[i].address,
                            notes: "ckmc8097@gmail.com"
                        });
                    }
                }, function (reason) {
                    window.alert('Failed: ' + reason);
                });

                $scope.showUserBottom = function (event) {
                    $mdBottomSheet.show({
                        templateUrl: 'scripts/user-bottom-sheet.tpl.html',
                        controller: 'jmFloatingButtonController',
                        targetEvent: event
                    });
                };

                $scope.showUser = function (event) {
                    $mdDialog.show({
                        controller: 'jmUserController',
                        templateUrl: 'src/user/user.tpl.html',
                        targetEvent: event
                    }).then(function (answer) {
                        $scope.alert = 'You said the information was "' + answer + '".';
                    }, function () {
                        $scope.alert = 'You cancelled the dialog.';
                    });
                };
            }
        };
    });

