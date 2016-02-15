'use strict';

export default angular.module('jmList', [
        require('angular-material'),
        require('../user'),
        require('../input')])

    .controller('jmListController', function ($scope, $document, $timeout, $window, $localStorage, $mdMedia, $mdDialog, jmDB, jmConstant) {
        let user,
            init = async() => {
                try {
                    let data = await jmDB.getItem('lastUpdateDate');
                    $scope.lastUpdate = data.lastUpdated;
                    $scope.lastUpdatedID = data.lastUpdatedID;
                } catch (reason) {
                }

                $scope.refresh($localStorage.user, true);
            },
            exportResolve = (entries) => {
                let link = document.createElement('a');
                link.setAttribute('href', encodeURI('data:text/csv;charset=utf-8,' + entries));
                link.setAttribute('download', 'McPeak Family.csv');
                link.click();
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

        $scope.refresh = async(userarg, init) => {
            user = userarg;

            if (!init) {
                $scope.queryAllInProgress = true;
            }

            try {
                let data = await jmDB.queryAll();

                $scope.users = data;

                if (user) {
                    $scope.selectUser(user);
                    let element = $document.find(jmConstant.userIdHash + user.id);
                    if (element.length) {
                        $timeout(() => element.click()[0].scrollIntoView(false), 200);
                    }
                } else {
                    $scope.queryAllInProgress = false;
                }
            }
            catch (reason) {
                $scope.queryAllInProgress = true;
                $scope.queryAllError = reason.message ? reason.message : 'Unknown Error';
            }
        };

        init();
    })

    .directive('jmList', () => {
        return {
            replace: true,
            template: require('../list/index.tpl.html'),
            controller: 'jmListController'
        };
    }).name;
