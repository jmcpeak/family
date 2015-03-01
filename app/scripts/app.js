angular
    .module('familyApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ngMaterial',
        'ui.grid',
        'ui.grid.moveColumns',
        'ui.grid.resizeColumns',
        'ui.grid.edit',
        'ui.grid.autoResize'
    ])

    .config(function ($routeProvider, $mdThemingProvider) {

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
            .accentPalette('pink')
            .warnPalette('yellow')
            .backgroundPalette('light-green');
    })

    .directive("jmList", function () {
        return {
            templateUrl: 'scripts/list.tpl.html',
            controller: function ($scope) {
                $scope.gridOptions = {
                    footerTemplate: 'scripts/footer-tpl.html',
                    showGridFooter: true,
                    columnDefs: [
                        {
                            field: 'name',
                            width: '20%'
                        },
                        {
                            field: 'city',
                            //aggregationType: uiGridConstants.aggregationTypes.sum,
                            width: '20%'
                        },
                        {
                            field: 'state',
                            //aggregationType: uiGridConstants.aggregationTypes.avg,
                            //aggregationHideLabel: true,
                            width: '20%'
                        },
                        {
                            field: 'country',
                            //aggregationType: uiGridConstants.aggregationTypes.min,
                            width: '20%',
                            displayName: 'Country'
                        },
                        {
                            field: 'email',
                            //aggregationType: uiGridConstants.aggregationTypes.max,
                            width: '20%',
                            displayName: 'E-Mail Address'
                        }
                    ],
                    data: [
                        {
                            "name": "Jason McPeak",
                            "city": "Key Largo",
                            "state": "FL",
                            "country": "USA",
                            "email": "jason.mcpeak@gmail.com"
                        }]
                };
            }
        };
    })

    .directive("jmHeader", function () {
        return {
            templateUrl: 'scripts/header.tpl.html',
            controller: function ($scope) {

                $scope.name = 'McPeak';

                $scope.lastUpdate = new Date();

                $scope.count = '100';

                $scope.todos = [];
                for (var i = 0; i < 5; i++) {
                    $scope.todos.push({
                        face: 'images/yeoman.png',
                        who: 'Cynthia "Cindy" & Steven (Steve) "Shorty" Christensen',
                        where: 'Pine River, WI',
                        notes: "ckmc8097@gmail.com"
                    });
                }
            }
        };
    });
