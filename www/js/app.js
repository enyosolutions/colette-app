// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('colette', ['ionic', 'colette.controllers', 'colette.services', 'ngResource', 'ngCordova', 'ui.calendar', 'countTo'])
    .config(['$sceDelegateProvider', function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://colette.dev/**', 'http://colette.enyosolutions.com/**']);
    }])
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                //cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // $ionicPlatform.fullScreen();
                // org.apache.cordova.statusbar required
                ionic.Platform.fullScreen();
                StatusBar.hide();
            }
        });
    })
    .constant('CONFIG', {baseUrl: 'http://colette.enyosolutions.com/api'})

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'AppCtrl'
            })

            .state('landing', {
                url: '/',
                templateUrl: 'templates/register/intro.html',
                controller: 'RegisterCtrl'
            })

            .state('register-intro', {
                url: '/register',
                templateUrl: 'templates/register/intro.html',
                controller: 'RegisterCtrl'
            })
            .state('register-step1-intro', {
                url: '/register/step1/intro',
                templateUrl: 'templates/register/step1-intro.html',
                controller: 'RegisterCtrl'
            })

            .state('register-step1-form', {
                url: '/register/step1/form',
                templateUrl: 'templates/register/step1-form.html',
                controller: 'RegisterCtrl'
            })
            .state('register-step2-intro', {
                url: '/register/step2/intro',
                templateUrl: 'templates/register/step2-intro.html',
                controller: 'RegisterCtrl'
            })
            .state('register-step2-form', {
                url: '/register/step2/form',
                templateUrl: 'templates/register/step2-form.html',
                controller: 'RegisterCtrl'
            })

            .state('register-step3-intro', {
                url: '/register/step3/intro',
                templateUrl: 'templates/register/step3-intro.html',
                controller: 'RegisterCtrl'
            })
            .state('register-step3-form', {
                url: '/register/step3/form',
                templateUrl: 'templates/register/step3-form.html',
                controller: 'RegisterCtrl'
            })

            .state('register-step4-intro', {
                url: '/register/step4/intro',
                templateUrl: 'templates/register/step4-intro.html',
                controller: 'RegisterCtrl'
            })
            .state('register-step4-form', {
                url: '/register/step4/form',
                templateUrl: 'templates/register/step4-form.html',
                controller: 'RegisterCtrl'
            })


            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppCtrl'
            })

            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/home.html'
                    }
                }
            })


            .state('app.intervenants-recherche', {
                url: '/intervenants/recherche',
                views: {
                    'menuContent': {
                        controller: 'IntervenantsCtrl',
                        templateUrl: 'templates/intervenants/form.html'
                    }
                }
            })

            .state('app.intervenants-resultats', {
                url: '/intervenants/resultats?:search',
                views: {
                    'menuContent': {
                        controller: 'IntervenantsCtrl',
                        templateUrl: 'templates/intervenants/intervenants.html'
                    }
                }
            })


            .state('app.intervenants-map', {
                url: '/intervenants/map',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/intervenants/map.html',
                        controller: 'IntervenantsCtrl'
                    }
                }
            })

            .state('app.intervenants-map-user', {
                url: '/intervenants/map/:intervenantId',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/intervenants/map.html',
                        controller: 'IntervenantsCtrl'
                    }
                }
            })
            .state('app.intervenants-agenda', {
                url: '/intervenants/intervenants/:intervenantId/agenda',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/intervenants/agenda.html',
                        controller: 'IntervenantsCtrl'
                    }
                }
            })
            .state('app.my-agenda', {
                url: '/my-agenda',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/my-calendar.html',
                        controller: 'UserCtrl'
                    }
                }
            })
            .state('app.my-agenda-intervenants', {
                url: '/my-agenda/:intervenantId-:firstname',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/my-calendar.html',
                        controller: 'UserCtrl'
                    }
                }
            })
            .state('app.encours', {
                url: '/encours',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/encours.html'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise(window.localStorage.getItem('User') ? '/app/home' : '/');


    });
