'use strict';

angular.module('jmFamily', [
    //replace:templates-app,
    'ngMaterial', 'ngTouch', 'ngRoute', 'ngMessages', 'ngResource', 'ngAnimate', 'ngCookies', 'ngStorage', 'jmList'])

    .config(function ($routeProvider, $mdThemingProvider) {

        String.prototype.hashCode = function () {
            var hash = 0, i, chr, len;
            if (this.length === 0) {
                return hash;
            }
            for (i = 0, len = this.length; i < len; i++) {
                chr = this.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        };

        // Initialize the Amazon Cognito credentials provider
        AWS.config.region = 'us-east-1';
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            AccountId: '754934490052',
            IdentityPoolId: 'us-east-1:0531f9e8-90fb-442c-9488-066f62d9a150',
            RoleArn: 'arn:aws:iam::754934490052:role/Cognito_mcpeakfamilyUnauth_DefaultRole',
            RoleSessionName: 'web'
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

        $mdThemingProvider.theme('error')
            .backgroundPalette('red');

        // Configure a dark theme with primary foreground yellow
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('green')
            .accentPalette('blue')
            .warnPalette('pink')
            .dark();
    })

    .config(['$mdIconProvider', function ($mdIconProvider) {
        $mdIconProvider
            .iconSet('action', '/assets/action-icons.svg', 24)
            .iconSet('alert', '/assets/alert-icons.svg', 24)
            .iconSet('av', '/assets/av-icons.svg', 24)
            .iconSet('communication', '/assets/communication-icons.svg', 24)
            .iconSet('content', '/assets/content-icons.svg', 24)
            .iconSet('device', '/assets/device-icons.svg', 24)
            .iconSet('editor', '/assets/editor-icons.svg', 24)
            .iconSet('file', '/assets/file-icons.svg', 24)
            .iconSet('hardware', '/assets/hardware-icons.svg', 24)
            .iconSet('icons', '/assets/icons-icons.svg', 24)
            .iconSet('image', '/assets/image-icons.svg', 24)
            .iconSet('maps', '/assets/maps-icons.svg', 24)
            .iconSet('navigation', '/assets/navigation-icons.svg', 24)
            .iconSet('notification', '/assets/notification-icons.svg', 24)
            .iconSet('social', '/assets/social-icons.svg', 24)
            .iconSet('toggle', '/assets/toggle-icons.svg', 24);
    }])

    .controller('jmLoginController', function ($scope, $timeout, $cookies, $q, $sessionStorage) {
        $scope.$storage = $sessionStorage;
        $scope.showInit = false;
        $scope.showListWait = true;

        if ($scope.$storage.credentials) {
            $scope.showLogin = false;
            $scope.showProgress = false;
            $scope.showOverlay = false;
            $scope.error = undefined;
        } else {
            $scope.showLogin = true;
            $scope.showOverlay = true;

            var deferredCognito = $q.defer();
            var deferredUser = $q.defer();
            var scope = $scope;

            $q.all([deferredCognito.promise, deferredUser.promise]).then(function () {
                scope.showProgress = false;
                scope.showOverlay = false;
            });
        }

        $scope.$root.$on('showListWait', function (event, value) {
            $scope.showListWait = value;
        });

        $scope.submit = function () {
            if (this.loginForm.question.$modelValue.toLowerCase().hashCode() === 463258776) {
                this.showProgress = true;
                this.showLogin = false;
                this.error = undefined;

                deferredUser.resolve();

                var that = this;
                AWS.config.credentials.get(function (err) {
                    if (!err) {
                        that.$storage.credentials = AWS.config.credentials;
                        deferredCognito.resolve();
                    }
                });
            } else {
                this.error = 'try again...';
            }
        };
    })

    .service('jmDB', function ($q, jmDBUtils) {
        var tableName = 'test';
        var dynamoDB = new AWS.DynamoDB({region: 'us-west-2'});

        this.guid = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };

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

        this.putItem = function (user) {
            var deferred = $q.defer();

            if (user.$$hashKey) {
                delete user.$$hashKey;
            }

            var convertedItem = jmDBUtils.convertFromJson(user);

            var params = {
                TableName: tableName,
                Item: convertedItem
            };

            dynamoDB.putItem(params, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.objectConverter(data.Item));
                }
            });

            return deferred.promise;
        };

        this.deleteItem = function (user) {
            var deferred = $q.defer();

            var params = {
                TableName: tableName,
                Key: {
                    id: {
                        S: user.id.toString()
                    }
                }
            };

            dynamoDB.deleteItem(params, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(jmDBUtils.objectConverter(data.Item));
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
                } else if (!!val.BOOL) {
                    data_out[key] = (val.BOOL);
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
                    subObj = {"BOOL": val};
                }
                else if (typeof val === 'string') {
                    var value = val.toString();
                    subObj = (value === '') ? {"NULL": true} : {"S": value};
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

