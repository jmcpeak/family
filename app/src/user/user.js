'use strict';

angular.module('jmUser', ['jmDB'])

    .controller("jmUserController", function ($scope, jmDB, locals) {

        $scope.disabled = false;

        jmDB.getUser(locals.id).then(function (data) {
            $scope.user = data;
        }, function (reason) {
            window.alert('Failed: ' + reason);
        });

        {

            //function loadAll() {
            //    var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming';
            //    return allStates.split(/, +/g).map(function (state) {
            //        return {
            //            value: state.toLowerCase(),
            //            display: state
            //        };
            //    });
            //}
            //
            //function querySearch(query) {
            //    var results = query ? $scope.states.filter(createFilterFor(query)) : [],
            //        deferred;
            //    if ($scope.simulateQuery) {
            //        deferred = $q.defer();
            //        $timeout(function () {
            //            deferred.resolve(results);
            //        }, Math.random() * 1000, false);
            //        return deferred.promise;
            //    } else {
            //        return results;
            //    }
            //}
            //
            //function createFilterFor(query) {
            //    var lowercaseQuery = angular.lowercase(query);
            //    return function filterFn(state) {
            //        return (state.value.indexOf(lowercaseQuery) === 0);
            //    };
            //}

            //$scope.states = loadAll();
            //$scope.selectedItem = undefined;
            //$scope.searchText = undefined;
            //$scope.querySearch = querySearch;
            //$scope.simulateQuery = false;
            //$scope.isDisabled = false;
        }
    });
