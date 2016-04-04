angular.module('colette.controllers', [])

    .controller('AppCtrl', function ($scope, $state, $ionicModal, $timeout, $localstorage, $ionicLoading, User, Intervenant) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        $scope.range = function (min, max, step) {
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) {
                input.push(i);
            }
            return input;
        };


        // Form data for the login modal
        $scope.loginData = {};


        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function () {
            $scope.modal.show();
        };


        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
            $ionicLoading.show({
                template: 'Connexion...'
            });
            console.log('Doing login', $scope.loginData);
            $localstorage.set('login', $scope.loginData);


            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function () {
                $ionicLoading.hide();
                $state.go('app.home');
            }, 500);
        };

    })

    .controller('RegisterCtrl', function ($scope, $state, $ionicModal, $timeout, $localstorage, $ionicLoading, User, $cordovaImagePicker) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});
        try {
            if (!$localstorage.getObject('user.temp')) {
                $localstorage.setObject('user.temp', {});
            }
        }
        catch (e) {
            console.error(e);
            $localstorage.setObject('user.temp', {});
        }

        function codeAddress(address) {
            geocoder.geocode({'address': address}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }

        $scope.range = function (min, max, step) {
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) {
                input.push(i);
            }
            return input;
        };


        // Step 1 : user information
        $scope.doRegisterStep1 = function () {
            $ionicLoading.show({
                template: 'Inscription...'
            });

            var tmp = $localstorage.getObject('user.temp');
            console.log(tmp);
            var user = angular.extend(tmp, $scope.newUser);
            console.log(user);
            $localstorage.setObject('user.temp', user);

            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $ionicLoading.hide();
            $state.go('register-step2-intro');
        };


        // Step 2 : user status, disability
        $scope.doRegisterStep2 = function () {
            $ionicLoading.show({
                template: 'Inscription...'
            });

            var tmp = $localstorage.getObject('user.temp');
            var user = angular.extend(tmp, $scope.newUser);
            $localstorage.setObject('user.temp', user);
            console.log(user);

            $ionicLoading.hide();
            $state.go('register-step3-intro');
        };


        // Step 3 : user contact, address ...
        $scope.doRegisterStep3 = function () {
            $ionicLoading.show({
                template: 'Inscription...'
            });
            console.log('Doing register', $scope.newUser);

            // Add extra data to the user account;
            var tmp = $localstorage.getObject('user.temp');
            var user = angular.extend(tmp, $scope.newUser);
            var address = user.address + ', ' + user.zipCode + ' ' + user.city;
            var geocoder = new google.maps.Geocoder();

            geocoder.geocode({'address': address}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    user.location = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
                $localstorage.setObject('user.temp', user);
                $ionicLoading.hide();
                $state.go('register-step4-intro');
            });
        };


        // Step 4 : user picture
        $scope.doRegisterStep4 = function () {

            $ionicLoading.show({
                template: 'Finalisation...'
            });
            console.log('Doing register', $scope.newUser);
            var tmp = $localstorage.getObject('user.temp');
            var user = angular.extend(tmp, $scope.newUser);
            $localstorage.setObject('User', user);
            console.log(user);
            var user = new User(user);
            user.$save();


            $timeout(function () {
                $ionicLoading.hide();
                $state.go('app.home');
            }, 500);
        };


        $scope.getImageSaveContact = function () {
            // Image picker will load images according to these settings
            var options = {
                maximumImagesCount: 1, // Max number of selected images, I'm using only one for this example
                width: 800,
                height: 800,
                quality: 80            // Higher is better
            };

            $cordovaImagePicker.getPictures(options).then(function (results) {
                // Loop through acquired images
                for (var i = 0; i < results.length; i++) {
                    console.log('Image URI: ' + results[i]);   // Print image URI
                    $scope.uploadedImage = results[i];
                    var tmp = $localstorage.getObject('user.temp');
                    tmp.picture = $scope.uploadedImage;
                    $localstorage.setObject('user.temp', tmp);
                }
            }, function (error) {
                console.log('Error: ' + JSON.stringify(error));    // In case of error
            });
        };

        var onSuccess = function (FILE_URI) {
            console.log(FILE_URI);
            $scope.picData = FILE_URI;
            $scope.$apply();
        };
        var onFail = function (e) {
            console.log("On fail " + e);
        }
        $scope.send = function () {
            var myImg = $scope.picData;
            var options = new FileUploadOptions();
            options.fileKey = "post";
            options.chunkedMode = false;
            var params = {};
            params.user_token = localStorage.getItem('auth_token');
            params.user_email = localStorage.getItem('email');
            options.params = params;
            var ft = new FileTransfer();
            ft.upload(myImg, encodeURI("https://example.com/posts/"), onUploadSuccess, onUploadFail, options);
        }


    }
)
    .controller('IntervenantsCtrl', function ($scope, $state, $stateParams, $ionicModal, $timeout, $localstorage, $ionicLoading, User, Intervenant, Meeting) {


        $scope.showBackButton = false;

        $scope.doSearch = function () {

            /*$ionicLoading.show({
             template: 'Recherche'
             });*/
            $state.go('app.intervenants-resultats', {search: JSON.stringify($scope.search), 'test': 'test'});
        };


        //Launch the search on the server
        $scope.execSearch = function () {
            console.log($scope.search);
            $scope.showBackButton = true;
            if ($state.params.search) {
                $scope.search = JSON.parse($state.params.search);
                $state.params.search = undefined;
            }
            var remoteQuery = {};
            if ($scope.search) {
                if ($scope.search.sort) {
                    remoteQuery['sort[' + $scope.search.sort + ']'] = 0;
                }
                if ($scope.search.skills) {
                    remoteQuery['query[skills]'] = $scope.search.skills;
                }
            }
            $scope.intervenants = Intervenant.query(remoteQuery);
            $scope.intervenants.$promise.then(function(intervenants){
                $localstorage.setObject('intervenants', intervenants);
            });

            console.log(remoteQuery);
            console.log($scope.intervenants);
        }


        // set up meeting between the intervenant and the client
        $scope.createMeeting = function (intervenantId, date, startTime, endTime) {

            $scope.User = $localstorage.getObject('User');
            var meeting = {clientId: User._id, intervenantId: intervenantId, date: date, startTime: startTime, endTime: endTime };


        };





        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/intervenants/profile.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        })


        $scope.openProfileModal = function (intervenantId) {
            for (var i in $scope.intervenants) {
                if ($scope.intervenants[i]._id === intervenantId) {
                    $scope.intervenant = $scope.intervenants[i];
                    console.log($scope.intervenant);
                    $scope.modal.show();
                    return;
                }
            }
        };
        $scope.closeModal = function () {
            $scope.modal.hide();
        };


        if ($state.is('app.intervenants-resultats')) {
            $scope.execSearch();
        }
    })

    .controller('MapCtrl', function ($scope, $state, $localstorage,  $cordovaGeolocation) {
        var options = {timeout: 10000, enableHighAccuracy: true};

        $scope.User = $localstorage.getObject('User');
        $scope.intervenants = $localstorage.getObject('intervenants');

        if(!$scope.User.location){
            $scope.User.location = {lat:1, lng:1}
        }
        var myLatlng = new google.maps.LatLng($scope.User.location.lat, $scope.User.location.lng);


        var mapOptions = {
            center: myLatlng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };


        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: $scope.map,
            title: 'moi',
            animation: google.maps.Animation.DROP
        });

        var focusIntervenant = undefined;
        if($state.params.intervenantId){
            focusIntervenant = $state.params.intervenantId;
        }

        for (var i in $scope.intervenants) {
            console.log($scope.intervenants);
            var latlng = new google.maps.LatLng($scope.intervenants[i].location.lat, $scope.intervenants[i].location.lng);
            var marker = new google.maps.Marker({
                position: latlng,
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                title: $scope.intervenants[i].firstname,
                icon: '/img/intervenants/map-anastasia-2.png'
            });
        }



    });