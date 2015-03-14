'use strict';
/* jshint -W117 */

angular.module('jmFamily', [
    //replace:templates-app,
    'ngAnimate', 'ngCookies', 'ngResource', 'ngRoute', 'ngSanitize', 'ngTouch', 'ngMaterial',
    'ngMessages', 'jmViewEdit', 'jmList'])

    .config(function ($routeProvider, $mdThemingProvider) {

        // Initialize the Amazon Cognito credentials provider
        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            AccountId: '754934490052',
            IdentityPoolId: 'us-east-1:0531f9e8-90fb-442c-9488-066f62d9a150',
            RoleArn: 'arn:aws:iam::754934490052:role/Cognito_mcpeakfamilyUnauth_DefaultRole',
            RoleSessionName: 'web'
        });

        // login
        AWS.config.credentials.get(function (err) {
            if (err) {
                //console.error(err);
            } else {
                //console.info("Cognito Identity Id:", AWS.config.credentials.identityId);
            }
        });

        $routeProvider
            .when('/', {
                templateUrl: 'partials/required.tpl.html',
                controller: 'jmPartialController'
            })
            .when('/required', {
                templateUrl: 'partials/required.tpl.html',
                controller: 'jmPartialController'
            })
            .when('/spouse', {
                templateUrl: 'partials/spouse.tpl.html',
                controller: 'jmPartialController'
            })
            .when('/additional', {
                templateUrl: 'partials/additional.tpl.html',
                controller: 'jmPartialController'
            })
            .when('/datesAndPlaces', {
                templateUrl: 'partials/datesAndPlaces.tpl.html',
                controller: 'jmPartialController'
            })
            .when('/children', {
                templateUrl: 'partials/children.tpl.html',
                controller: 'jmPartialController'
            })

            .otherwise({
                redirectTo: '/'
            });

        // Update the theme colors to use themes on font-icons
        // red, pink, purple, deep-purple, indigo, blue, light-blue, cyan, teal, green, light-green, lime,
        // yellow, amber, orange, deep-orange, brown, grey, blue-grey
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('blue')
            .warnPalette('pink');
        //.backgroundPalette('teal');

        // Configure a dark theme with primary foreground yellow
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('green')
            .accentPalette('blue')
            .warnPalette('pink')
            .dark();
    })

    .controller("jmPartialController", function () {})

    .controller("jmFloatingButtonController", function ($scope) {

        $scope.items = [
            {name: 'Share', icon: 'share'},
            {name: 'Upload', icon: 'upload'},
            {name: 'Copy', icon: 'copy'},
            {name: 'Print this page', icon: 'print'}
        ];
    })

    .directive("jmFloatingDesktopButtons", function () {
        return {
            scope: true,
            templateUrl: 'floatingButtons.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .directive("jmFloatingMobileAddButton", function () {
        return {
            scope: true,
            templateUrl: 'floatingMobileButton.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .directive("jmFloatingMobileDeleteButton", function () {
        return {
            scope: true,
            templateUrl: 'floatingMobileDeleteButton.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .directive("jmFloatingDesktopDeleteButton", function () {
        return {
            scope: true,
            templateUrl: 'floatingDesktopDeleteButton.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .service('jmDB', function ($q, jmDBUtils) {
        var tableName = 'test';
        var dynamoDB = new AWS.DynamoDB({region: 'us-west-2'});

        this.queryAll = function () {
            var deferred = $q.defer();

            dynamoDB.scan({TableName: tableName}, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.arrayConverter(data.Items));
                }
            });

            return deferred.promise;
        };

        this.getUser = function (id) {
            var deferred = $q.defer();

            var params = {
                TableName: tableName,
                Key: {
                    id: {
                        S: id.toString()
                    }
                }
            };

            dynamoDB.getItem(params, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.objectConverter(data.Item));
                }
            });

            return deferred.promise;
        };
    })

    .service('jmDBUtils', function () {

        this.arrayConverter = function (data) {
            var data_out = [];

            if (!data) {
                return data_out;
            }

            for (var i = 0; i < data.length; i++) {
                data_out.push(this.objectConverter(data[i]));
            }

            return data_out;
        };

        this.objectConverter = function (data) {
            var data_out = {};

            if (!data) {
                return data_out;
            }

            Object.keys(data).forEach(function (key) {
                var val = data[key];

                if (!!val.S) {
                    data_out[key] = val.S;
                } else if (!!val.N) {
                    data_out[key] = parseInt(val.N);
                } else if (!!val.B) {
                    data_out[key] = (val.B.toLowerCase() === 'true');
                } else if (!!val.SS) {
                    data_out[key] = val.SS;
                } else if (!!val.NS) {
                    var val_arr = [];
                    for (var j = 0; j < val.NS.length; j++) {
                        val_arr.push(parseInt(val.NS[j]));
                    }
                    data_out[key] = val_arr;
                } else if (!!val.BS) {
                    var val_arr2 = [];
                    for (var jj = 0; jj < val.BS.length; jj++) {
                        val_arr2.push((val.BS[jj].toLowerCase() === 'true'));
                    }
                    data_out[key] = val_arr2;
                }
            });

            return data_out;
        };

        this.convertFromJson = function (data) {
            var data_out = {};
            if (!data) {
                return data_out;
            }

            Object.keys(data).forEach(function (key) {
                var subObj = {};
                var val = data[key];
                // if
                if (!(typeof val === 'undefined' || (!val && typeof val !== 'boolean'))) {
                    subObj = null;
                }

                if (typeof val === 'boolean') {
                    subObj = {"B": val.toString()};
                }
                else if (typeof val === 'string') {
                    subObj = {"S": val.toString()};
                }
                else if (typeof val === 'number') {
                    subObj = {"N": val.toString()};
                }
                else if (typeof val === 'object') {
                    if (Array.isArray(val) && val.length >= 1) {
                        var subObjKey = null;
                        if (typeof val[0] === 'boolean') {
                            subObjKey = "BS";
                        }
                        else if (typeof val[0] === 'string') {
                            subObjKey = "SS";
                        }
                        else if (typeof val[0] === 'number') {
                            subObjKey = "NS";
                        }

                        if (!!subObjKey) {
                            var subObjArr = [];
                            for (var i = 0; i < val.length; i++) {
                                subObjArr.push(val.toString());
                            }
                            subObj[subObjKey] = subObjArr;
                        }
                    }
                } else {
                    subObj = null;
                }

                if (!!subObj) {
                    data_out[key] = subObj;
                }
            });

            return data_out;
        };
    });

