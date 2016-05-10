angular.module('colette.controllers').controller('RegisterCtrl', function ($scope, $state, $ionicModal, $timeout, $localstorage, $timeout, $ionicLoading, $ionicPopup, $ionicViewSwitcher, User, $cordovaImagePicker) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    if ($state.is('app.home')) {
        console.log('is home');
        $timeout(function () {
            $scope.showBackButton = false;
        });
    }
    else {
        $timeout(function () {
            $scope.showBackButton = true;
        });
    }


    try {
        if (!$localstorage.getObject('user.temp')) {
            $localstorage.setObject('user.temp', {});
        }
    }
    catch (e) {
        console.error(e);
        $localstorage.setObject('user.temp', {});
    }

    $scope.newUser = $localstorage.getObject('user.temp');

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
        var user = angular.extend(tmp, $scope.newUser);
        console.log(user);
        $localstorage.setObject('user.temp', user);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $ionicLoading.hide();
        $state.go('register-step3-intro');
    };


    // Step 2 : user status, disability
    $scope.doRegisterStep2 = function () {


        var tmp = $localstorage.getObject('user.temp');
        var user = angular.extend(tmp, $scope.newUser);
        $localstorage.setObject('user.temp', user);
        $state.go('register-step3-intro');
    };


    // Step 3 : user contact, address ...
    $scope.doRegisterStep3 = function () {
        $ionicLoading.show({
            template: 'Inscription...'
        });

        // Add extra data to the user account;
        var tmp = $localstorage.getObject('user.temp');
        var user = angular.extend(tmp, $scope.newUser);
        var address = user.address + ', ' + user.zipCode;
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({'address': address}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                console.log(results[0].geometry.location);
                user.location = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng()
                };
            } else {
                // alert('Geocode was not successful for the following reason: ' + status);
            }
            $localstorage.setObject('user.temp', user);
            $ionicLoading.hide();
            $state.go('register-step4-intro');
        });
    };


    // Step 4 : user picture
    $scope.doRegisterStep4 = function () {


        if ($scope.newUser.password !== $scope.newUser.confirmPassword) {
            $ionicPopup.alert({
                title: 'Bonjour Colette',
                template: 'Le mot de passe et sa confirmation ne correspondent pas.',
                buttons: [{
                    text: "OK",
                    type: 'button-assertive'
                }]
            });
        }
        else {
            $ionicLoading.show({
                template: 'Finalisation...'
            });
            var tmp = $localstorage.getObject('user.temp');
            var user = angular.extend(tmp, $scope.newUser);

            var userClass = new User(user);
            userClass.$save().then(function (data) {
                $localstorage.setObject('User', data);
                $ionicLoading.hide();
                $state.go('app.home');
            });

            $timeout(function () {
                $ionicLoading.hide();
            }, 5000);
        }
    };

    /*
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
     };

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
     };


     */

})
