'use strict';

import md from "angular-material";

export default angular.module('jmList', [md])

    .controller('jmListController', function ($scope, $document, $timeout, $window, $localStorage, $mdMedia, $mdDialog, jmDB, jmConstant) {
        let init = async() => {
            try {
                let data = await Promise.all([jmDB.queryAll(), jmDB.getItem('lastUpdateDate')]);
                $scope.users = data[0];
                $scope.lastUpdate = data[1].lastUpdated;
                $scope.lastUpdatedID = data[1].lastUpdatedID;
                $scope.refresh($localStorage.user);
                $scope.queryAllInProgress = false;
            }
            catch (err) {
                $scope.queryAllInProgress = false;
                $scope.queryAllError = err.message ? err.message : 'Unknown Error';
            }
        };

        $scope.count = '';
        $scope.queryAllInProgress = true;

        // used in user.index.js
        $scope.refresh = (user) => {
            if (user) {
                $scope.selectUser(user);
                let element = $document.find(jmConstant.userIdHash + user.id);
                if (element.length) {
                    $timeout(() => element.click()[0].scrollIntoView(false), 200);
                }
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
