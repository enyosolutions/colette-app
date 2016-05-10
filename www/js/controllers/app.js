angular.module('colette.controllers').controller('AppCtrl', function ($scope, $rootScope, $state, $ionicModal, $ionicPopup, $timeout, $localstorage, $ionicLoading, $ionicHistory, $ionicViewSwitcher, User, Intervenant) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $rootScope.menuIsOpen = true;
    $scope.showBackButton = true;


    $scope.range = function (min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };


    $scope.goBack = function () {
        $ionicHistory.goBack();
        $ionicViewSwitcher.nextDirection('forward');
    };

    // Form data for the login modal
    $scope.loginData = {};


    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        $ionicLoading.show({
            template: 'Connexion...'
        });
        if (!$scope.loginData.email || $scope.loginData.email == "") {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Bonjour Colette', template: 'Vérifiez votre adresse email.', buttons: [{
                    text: "OK",
                    type: 'button-assertive'
                }]
            });
        }
        else if (!$scope.loginData.password || $scope.loginData.password == "") {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Bonjour Colette', template: 'Vérifiez le mot de passe que vous avez saisi.',
                buttons: [{
                    text: "OK",
                    type: 'button-assertive'
                }]
            });

        }
        else {
            $localstorage.set('login', $scope.loginData);

            User.query({'query[email]': $scope.loginData.email}).$promise.then(function (users) {
                if (users.length > 0) {
                    $localstorage.setObject('User', users[0]);
                    $state.go('app.home');
                } else {
                    $ionicPopup.alert({
                        title: 'Bonjour Colette',
                        template: "Nous n'avons pas réussi à vous identifier.",
                        buttons: [{
                            text: "OK",
                            type: 'button-assertive'
                        }]
                    });
                }
                $ionicLoading.hide();
            });

            $timeout(function () {
                $ionicLoading.hide();
            }, 4000);
        }

    };


    if ($state.is('app.home')) {
        console.log('is home');
        $timeout(function () {
            $rootScope.showBackButton = false;
        });
    }
    else {
        $timeout(function () {
            $rootScope.showBackButton = true;
        });
    }

});