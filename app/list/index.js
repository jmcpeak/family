'use strict';

export default angular.module('jmList', [
        require('angular-material'),
        require('../user'),
        require('../input')])

    .controller('jmListController', function ($scope, $timeout, $window, $localStorage, $mdMedia, $mdDialog, jmDB, jmConstant) {
        let user,
            init = () => {
                jmDB.getItem('lastUpdateDate').then((data) => {
                    $timeout(() => {
                        $scope.lastUpdate = data.lastUpdated;
                        $scope.lastUpdatedID = data.lastUpdatedID;
                    });
                });

                $scope.refresh($localStorage.user, true);
            },
            exportResolve = (entries) => {
                let link = document.createElement('a');
                link.setAttribute('href', encodeURI('data:text/csv;charset=utf-8,' + entries));
                link.setAttribute('download', 'McPeak Family.csv');
                link.click();
            },
            refreshResolve = (data) => {
                $scope.users = data;

                if (user) {
                    $scope.selectUser(user);
                    $timeout(() => angular.element(jmConstant.userIdHash + user.id).click()[0].scrollIntoView(false), 200);
                } else {
                    $scope.queryAllInProgress = false;
                }
            },
            refreshReject = (reason) => {
                $scope.queryAllInProgress = true;
                $scope.queryAllError = reason.message ? reason.message : 'Unknown Error';
            };

        $scope.users = [];
        $scope.count = '';
        $scope.height = 'auto';
        $scope.showDelete = false;
        $scope.queryAllInProgress = false;
        $scope.export = () => jmDB.exportToCSV().then(exportResolve);
        $scope.openUrl = (url) => $window.open(url, '_blank');

        $scope.getCount = (data) => {
            let additional = 0;
            angular.forEach(data, (entry) => {
                if (entry.firstNameSpouse && entry.firstNameSpouse.length >= 1) {
                    additional++;
                }

                angular.forEach(entry.children, (child) => {
                    if (entry['firstNameChild' + child] && entry['firstNameChild' + child].length >= 1) {
                        additional++;
                    }
                });
            });

            return data.length + additional;
        };

        $scope.refresh = (userarg, init) => {
            user = userarg;

            if (!init) {
                $scope.queryAllInProgress = true;
            }

            return jmDB.queryAll().then(refreshResolve, refreshReject);
        };

        init();
    })

    .directive('jmList', () => {
        return {
            replace: true,
            template: require('../list/list.tpl.html'),
            controller: 'jmListController'
        };
    }).name;
