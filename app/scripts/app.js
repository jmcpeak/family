'use strict';
/* jslint -W117 */

var dynamodb;
var endpoint;

angular
    .module('familyApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngMaterial',
        'ngMessages'
    ])

    .config(function ($routeProvider, $mdThemingProvider) {

        AWS.config.region = 'us-west-1';
        AWS.config.update({
            accessKeyId: 'AKIAIVDNGMPTDA7FTXQA',
            secretAccessKey: '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'
        });

        dynamodb = new AWS.DynamoDB({region: 'us-west-2'});

        var params = {
            ExclusiveStartTableName: 'STRING_VALUE',
            Limit: 0
        };

        dynamodb.listTables(params, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                console.log(data);           // successful response
            }
        });

        //endpoint = AWS.Endpoint();

        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        // Update the theme colors to use themes on font-icons
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('blue')
            .warnPalette('yellow');//.backgroundPalette('light-green');

        // Configure a dark theme with primary foreground yellow
        $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
    })

    .directive("jmList", function (jmFactory) {
        return {
            scope: true,
            templateUrl: 'scripts/list.tpl.html',
            controller: function ($scope, $mdDialog, $mdBottomSheet) {
                $scope.name = 'McPeak';

                $scope.lastUpdate = new Date();

                $scope.count = '100';

                $scope.todos = [];

                for (var i = 0; i < 8; i++) {
                    $scope.todos.push({
                        face: 'images/yeoman.png',
                        who: 'Cynthia "Cindy" & Steven (Steve) "Shorty" Christensen',
                        where: 'Pine River, WI',
                        notes: "ckmc8097@gmail.com"
                    });
                }

                $scope.showUserBottom = function (event) {
                    $mdBottomSheet.show({
                        templateUrl: 'scripts/user-bottom-sheet.tpl.html',
                        controller: 'jmFloatingButtonController',
                        targetEvent: event
                    });
                };

                $scope.showUser = function (event) {
                    jmFactory.setDialogOpen(true);
                    $mdDialog.show({
                        controller: 'jmDialogController',
                        templateUrl: 'scripts/user.tpl.html',
                        targetEvent: event
                    }).then(function (answer) {
                        $scope.alert = 'You said the information was "' + answer + '".';
                    }, function () {
                        $scope.alert = 'You cancelled the dialog.';
                        jmFactory.setDialogOpen(false);
                    });
                };
            }
        };
    })

    .directive("jmFloatingDesktopButtons", function () {
        return {
            scope: true,
            templateUrl: 'scripts/floatingButtons.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .directive("jmFloatingMobileAddButton", function () {
        return {
            scope: true,
            templateUrl: 'scripts/floatingMobileButton.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .directive("jmFloatingMobileDeleteButton", function () {
        return {
            scope: true,
            templateUrl: 'scripts/floatingMobileDeleteButton.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .directive("jmFloatingDesktopDeleteButton", function () {
        return {
            scope: true,
            templateUrl: 'scripts/floatingDesktopDeleteButton.tpl.html',
            controller: 'jmFloatingButtonController'
        };
    })

    .controller("jmDialogController", function ($scope, $mdDialog, $timeout, $q, jmFactory) {

        $scope.isDialogOpen = function () {
            return jmFactory.isDialogOpen();
        };

        $scope.test = ['wi', 'jason', 'sheila'];

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };

        $scope.user = {
            title: undefined,
            email: 'ipsum@lorem.com',
            firstName: 'Jason',
            lastName: 'McPeak',
            company: 'Google',
            address: '1600 Amphitheatre Pkwy',
            city: 'Mountain View',
            state: 'CA',
            biography: 'Loves kittens, snowboarding, and can type at 130 WPM.\n\nAnd rumor has it she bouldered up Castle Craig!',
            postalCode: '94043',
            gender: true
        };

        function loadAll() {
            var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana, Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana, Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina, North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina, South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming';
            return allStates.split(/, +/g).map(function (state) {
                return {
                    value: state.toLowerCase(),
                    display: state
                };
            });
        }

        function querySearch(query) {
            var results = query ? $scope.states.filter(createFilterFor(query)) : [],
                deferred;
            if ($scope.simulateQuery) {
                deferred = $q.defer();
                $timeout(function () {
                    deferred.resolve(results);
                }, Math.random() * 1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        }

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(state) {
                return (state.value.indexOf(lowercaseQuery) === 0);
            };
        }

        $scope.states = loadAll();
        $scope.selectedItem = undefined;
        $scope.searchText = undefined;
        $scope.querySearch = querySearch;
        $scope.simulateQuery = false;
        $scope.isDisabled = false;
    })

    .controller("jmFloatingButtonController", function ($scope) {

        $scope.items = [
            {name: 'Share', icon: 'share'},
            {name: 'Upload', icon: 'upload'},
            {name: 'Copy', icon: 'copy'},
            {name: 'Print this page', icon: 'print'},
        ];

        $scope.getAdd = function () {
            return 'bower_components/material-design-icons/content/svg/production/ic_add_24px.svg';
        };

        $scope.getEmail = function () {
            return 'bower_components/material-design-icons/communication/svg/production/ic_email_24px.svg';
        };

        $scope.getPrint = function () {
            return 'bower_components/material-design-icons/action/svg/production/ic_print_24px.svg';
        };

        $scope.getRemove = function () {
            return 'bower_components/material-design-icons/action/svg/production/ic_delete_24px.svg';
        };
    })

    .factory('jmFactory', function () {
        var open = false;

        return {
            setDialogOpen: function (param) {
                open = param;
            },
            isDialogOpen: function () {
                return open;
            }
        };
    });
