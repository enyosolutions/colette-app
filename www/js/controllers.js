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

            console.log(user);
            var userClass = new User(user);
            userClass.$save().then(function (data) {
                console.log(data);
                $localstorage.setObject('User', data);
                $ionicLoading.hide();
                $state.go('app.home');
            });
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
    .controller('IntervenantsCtrl', function ($scope, $state, $stateParams, $ionicModal, $timeout, $localstorage, $ionicHistory,
                                              $ionicBackdrop, $ionicLoading, $cordovaGeolocation, uiCalendarConfig, User, Intervenant, Meeting) {

        $scope.User = $localstorage.getObject('User');
        console.log($scope.User._id);
        $scope.goBack = function () {
            $ionicHistory.goBack();
        };

        $scope.showBackButton = false;
        $scope.eventSources = [];

        $scope.uiConfig = {
            calendar: {
                editable: true,
                firstDay: 1,
                defaultView: 'agendaWeek',
                views: {
                    defaultView: 'agendaWeek'
                },
                header: {
                    left: 'prev',
                    center: 'title',
                    right: 'next'
                },
                slotDuration: '00:30:00',
                defaultTimedEventDuration: '01:00:00',
                allDaySlot: false,
                defaultDate: new moment(),
                selectable: true,
                selectHelper: true,
                minTime: '08:00:00',
                maxTime: '20:00:00',
                select: function (start, end) {
                    var events = uiCalendarConfig.calendars.modalCalendar.fullCalendar( 'clientEvents');
                    console.log(events);
                    
                    for(var i in events){
                        var mStart = new moment(start);
                        var mEnd = new moment(end);
                        console.log(events[i].start, events[i].end, start, end);
                        if (events[i].start.isBetween(start, end) || events[i].end.isBetween(start, end)
                        ||  mStart.isBetween(events[i].start, events[i].end) || mEnd.isBetween(events[i].start, events[i].end)
                        ){
                            uiCalendarConfig.calendars.modalCalendar.fullCalendar('unselect');
                            return alert("Cet horaire n'est pas disponible dans vos agendas communs" );
                        }
                    }
                    if (confirm('Proposer un rendez-vous à ' + $scope.focusIntervenant.firstname + ' ? ')) {
                        var meeting = {
                            clientId: $scope.User._id,
                            intervenantId: $scope.focusIntervenant._id,
                            start: start,
                            end: end,
                            skill: $scope.search ? $scope.search.skills : null,
                            status: "attente-intervenant"
                        };

                        var m = new Meeting(meeting);
                        m.$save().then(function () {
                            meeting.title = 'Rendez vous avec : ' + $scope.focusIntervenant.firstname;
                            meeting.className = 'assertive-bg';
                            console.log(meeting);
                            //  uiCalendarConfig.calendars.profileCalendar.fullCalendar('unselect');

                            uiCalendarConfig.calendars.modalCalendar.fullCalendar('renderEvent', meeting, true); // stick? = true
                            alert("Votre demande de rendez vous a bien été transmise à " + $scope.focusIntervenant.firstname + ". Elle vous répondra très rapidement.");
                        });
                    }
                    uiCalendarConfig.calendars.modalCalendar.fullCalendar('unselect');

                },
                editable: false,
                slotEventOverlap: false
            }
        };

        console.log(uiCalendarConfig);

        $scope.doSearch = function () {

            /*$ionicLoading.show({
             template: 'Recherche'
             });*/
            $state.go('app.intervenants-resultats', {search: JSON.stringify($scope.search), 'test': 'test'});
        };


        //Launch the search on the server
        $scope.execSearch = function () {
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
            $scope.intervenants.$promise.then(function (intervenants) {
                $localstorage.setObject('intervenants', intervenants);
            });
        }


        // set up meeting between the intervenant and the client

        // Create the profile modal that we will use later
        $ionicModal.fromTemplateUrl('templates/intervenants/profile.html', {
            scope: $scope,
            animation: 'animated bounceIn',
            hideDelay: 220
        }).then(function (modal) {
            $scope.modal = modal;
            $ionicBackdrop.release();
        });

        // Create the modal for the planning
        $ionicModal.fromTemplateUrl('templates/intervenants/agenda.html', {
            scope: $scope,
            animation: 'animated bounceIn',
            hideDelay: 220
        }).then(function (modal) {
            $scope.agendaModal = modal;
            $ionicBackdrop.release();
        });

        $scope.openProfileModal = function (intervenantId) {
            if (!$scope.focusIntervenant || $scope.focusIntervenant._id !== intervenantId) {
                for (var i in $scope.intervenants) {
                    if ($scope.intervenants[i]._id === intervenantId) {
                        $scope.focusIntervenant = $scope.intervenants[i];
                    }
                }
            }

            $scope.modal.show();
            $ionicBackdrop.release();
            $timeout(function () {
                // uiCalendarConfig.calendars.profileCalendar.fullCalendar("render");
            }, 1000);
        }


        $scope.openAgendaModal = function (intervenantId) {

            // $scope.modal.hide();
            console.log(intervenantId);
            if (!$scope.focusIntervenant || $scope.focusIntervenant._id !== intervenantId) {
                for (var i in $scope.intervenants) {
                    if ($scope.intervenants[i]._id === intervenantId) {
                        $scope.focusIntervenant = $scope.intervenants[i];
                    }
                }
            }
            uiCalendarConfig.calendars.modalCalendar.fullCalendar('removeEvents');

            $timeout(function () {
                uiCalendarConfig.calendars.modalCalendar.fullCalendar("render");
            }, 250);
            var meetingsList = Meeting.query({'query[intervenantId]': $scope.focusIntervenant._id});
            meetingsList.$promise.then(function (data) {
                $scope.eventSources = [];
                $scope.agendaModal.show();
                data = data.map(function(d){
                    if (d.clientId === $scope.User._id) {
                        d.className = 'assertive-bg';
                        d.title = 'Mon rendez-vous';
                    }
                    else{
                        d.className = 'royal-bg';
                    }

                    //$scope.eventSources.push(d);
                    return d;
                });

                uiCalendarConfig.calendars.modalCalendar.fullCalendar('addEventSource', {events: data});
                /*
                if (data) {
                    $scope.eventSources = data;
                }
                else{
                    $scope.eventSources = [];
                }
                */
                console.log(data);

                //uiCalendarConfig.calendars.modalCalendar.fullCalendar("render");
                console.log(uiCalendarConfig.calendars);

                $timeout(function () {

                }, 250);

            });

        };

        $scope.closeModal = function () {
            $scope.modal.hide();
        };

        $scope.$on('$destroy', function () {
            $scope.modal.remove();
        });

        if ($state.is('app.intervenants-resultats')) {

            $scope.execSearch();
        }

        if ($state.is('app.intervenants-map-user') || $state.is('app.intervenants-map') || $state.is('app.intervenants-agenda')) {

            var options = {timeout: 10000, enableHighAccuracy: true};

            $scope.User = $localstorage.getObject('User');
            $scope.intervenants = $localstorage.getObject('intervenants');
            $scope.focusIntervenant = undefined;
            console.log($state.params.intervenantId);

            if ($state.params.intervenantId) {
                var focusIntervenantId = $state.params.intervenantId;
                for (var i in $scope.intervenants) {
                    if (focusIntervenantId === $scope.intervenants[i]._id) {
                        $scope.focusIntervenant = $scope.intervenants[i];
                    }
                }
            }

            var location = {lat: 1, lng: 1};
            if ($scope.focusIntervenant && $scope.focusIntervenant.location) {
                location = $scope.focusIntervenant.location;
            }
            else if ($scope.User.location) {
                location = $scope.User.location;
            }
            var myLatlng = new google.maps.LatLng(location.lat, location.lng);


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


            for (var i in $scope.intervenants) {
                var latlng = new google.maps.LatLng($scope.intervenants[i].location.lat, $scope.intervenants[i].location.lng);
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: $scope.map,
                    animation: google.maps.Animation.DROP,
                    title: $scope.intervenants[i].firstname,
                    icon: '/img/intervenants/map-' + $scope.intervenants[i].firstname.toLowerCase() + '-' + ($scope.focusIntervenant._id === $scope.intervenants[i]._id ? 'rose' : 'bleu') + '.png'
                });
                google.maps.event.addListener(marker, 'click', function () {
                    $scope.openProfileModal($scope.intervenants[i]._id);
                });
            }
        }
    });

