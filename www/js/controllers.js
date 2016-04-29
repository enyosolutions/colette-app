angular
    .module('colette.controllers', [])
    .run(function ($rootScope, $timeout, $state, $localstorage) {
        $rootScope.menuScrollLeft = function () {
            console.log('scroll left');
            return;
            $rootScope.menuIsOpen = false;
        };

        $rootScope.menuScrollRight = function (evt) {
            console.log('scroll right');
            console.log(evt);
            return;
            if (evt && evt.gesture.distance > 300) {
                $rootScope.menuIsOpen = true;
            }
        };


        /*        setTimeout(function () {
         console.log($state.current.name);
         console.log('going home');
         $state.go('app.home');

         }, 20000);*/


        if ($localstorage.getObject('User')) {
            $state.go('app.home');

        }
    })
    .controller('AppCtrl', function ($scope, $rootScope, $state, $ionicModal, $ionicPopup, $timeout, $localstorage, $ionicLoading, $ionicHistory, $ionicViewSwitcher, User, Intervenant) {
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        $rootScope.menuIsOpen = true;


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

        }

    })
    .
    controller('RegisterCtrl', function ($scope, $state, $ionicModal, $timeout, $localstorage, $ionicLoading, $ionicViewSwitcher, User, $cordovaImagePicker) {

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
            console.log(user);

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
                    user.location = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    };
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


            console.log('Doing register', $scope.newUser);
            if ($scope.newUser.password !== $scope.newUser.confirmPassword) {
                alert('Le mot de passe et sa confirmation ne correspondent pas.');
            }
            else {
                $ionicLoading.show({
                    template: 'Finalisation...'
                });
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
            }
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


    })

    .controller('UserCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicModal, $timeout, $localstorage, $ionicHistory,
                                      $ionicBackdrop, $ionicLoading, $cordovaGeolocation, $ionicScrollDelegate,
                                      $ionicViewSwitcher,
                                      uiCalendarConfig, User, Intervenant, Meeting, Commentaire) {

        $rootScope.menuIsOpen = true;


        moment.locale('fr', {
            months: "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
            monthsShort: "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
            weekdays: "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
            weekdaysShort: "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
            weekdaysMin: "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                LTS: "HH:mm:ss",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Aujourd'hui à] LT",
                nextDay: '[Demain à] LT',
                nextWeek: 'dddd [à] LT',
                lastDay: '[Hier à] LT',
                lastWeek: 'dddd [dernier à] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: "dans %s",
                past: "il y a %s",
                s: "quelques secondes",
                m: "une minute",
                mm: "%d minutes",
                h: "une heure",
                hh: "%d heures",
                d: "un jour",
                dd: "%d jours",
                M: "un mois",
                MM: "%d mois",
                y: "une année",
                yy: "%d années"
            },
            ordinalParse: /\d{1,2}(er|ème)/,
            ordinal: function (number) {
                return number + (number === 1 ? 'er' : 'ème');
            },
            meridiemParse: /PD|MD/,
            isPM: function (input) {
                return input.charAt(0) === 'M';
            },
            // in case the meridiem units are not separated around 12, then implement
            // this function (look at locale/id.js for an example)
            // meridiemHour : function (hour, meridiem) {
            //     return /* 0-23 hour, given meridiem token and hour 1-12 */
            // },
            meridiem: function (hours, minutes, isLower) {
                return 'h';
            },
            week: {
                dow: 1, // Monday is the first day of the week.
                doy: 4  // The week that contains Jan 4th is the first week of the year.
            }
        });


        $scope.User = $localstorage.getObject('User');
        console.log($scope.User._id);


        $scope.eventSources = [];

        //BASIC CONFIG
        $scope.uiConfig = {
            calendar: {
                lang: 'fr',
                selectable: true,
                editable: false,
                slotEventOverlap: false,
                firstDay: 1,
                defaultView: 'agendaWeek',
                views: {
                    agendaWeek: {
                        minTime: '08:00:00',
                        maxTime: '20:00:00'
                    }
                },
                header: {
                    left: 'prev',
                    center: 'title',
                    right: 'next'
                },
                slotDuration: '01:00:00',
                defaultTimedEventDuration: '01:00:00',
                allDaySlot: false,
                defaultDate: new moment(),
                axisFormat: 'HH[h]',
                selectHelper: true,
                height: '726px',
                minTime: '08:00:00',
                maxTime: '20:00:00',
                hiddenDays: [0],
                timeFormat: {
                    agendaWeek: 'HH:mm'
                },
                columnFormat: {
                    agendaWeek: "dddd DD"
                },
                select: function (start, end) {
                    console.log('my calendar event');
                    var events = uiCalendarConfig.calendars.myCalendar.fullCalendar('clientEvents');
                    /*
                     for (var i in events) {
                     var mStart = new moment(start);
                     var mEnd = new moment(end);
                     console.log(events[i].start, events[i].end, start, end);
                     if (events[i].start.isBetween(start, end) || events[i].end.isBetween(start, end)
                     || mStart.isBetween(events[i].start, events[i].end) || mEnd.isBetween(events[i].start, events[i].end)
                     ) {
                     uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
                     return alert("Cet horaire n'est pas disponible dans vos agendas communs");
                     }
                     }

                     */


                    start.locale('fr');
                    if (confirm('Rendre le créneau de ' + start.format("HH:mm") + ' à ' + end.format("HH:mm") + ' indisponible dans votre calendrier ?')) {
                        var meeting = {
                            beneficiaireId: $scope.User._id,
                            intervenantId: null,
                            start: start,
                            end: end,
                            skill: $scope.search ? $scope.search.skills : null,
                            status: "attente-intervenant",
                            type: "creneau-occupe",
                            title: "Vous n'êtes pas disponible"
                        };

                        var m = new Meeting(meeting);
                        m.$save().then(function () {
                            meeting.title = "Vous n'êtes pas disponible";
                            meeting.className = 'balanced-bg';
                            //  uiCalendarConfig.calendars.profileCalendar.fullCalendar('unselect');

                            uiCalendarConfig.calendars.myCalendar.fullCalendar('renderEvent', meeting, true); // stick? = true
                            alert("Votre créneau a bien été vérouillé.");
                        });
                    }
                    uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');

                }
            }
        };


        //MOVE THE CALENDAR TO THE NEXT WEEK
        $scope.moveNextWeek = function (evt, d) {
            console.log(evt.gesture);
            console.log(evt.gesture.distance);
            console.log('next week');

            if (evt.gesture.distance > 650) {
                $ionicLoading.show({
                    template: 'Chargement'
                });
                uiCalendarConfig.calendars.myCalendar.fullCalendar('next');
                $timeout(function () {
                    $ionicLoading.hide();
                }, 200);

            }
        };

        //MOVE THE CALENDAR TO THE PREVIOUS WEEK
        $scope.movePreviousWeek = function (evt) {
            if (evt.gesture.distance > 650) {
                $ionicLoading.show({
                    template: 'Chargement'
                });
                uiCalendarConfig.calendars.myCalendar.fullCalendar('prev');
                $timeout(function () {
                    $ionicLoading.hide();
                }, 200);

            }
        };

        var meetingsList = Meeting.query({'query[beneficiaireId]': $scope.User._id});
        meetingsList.$promise.then(function (data) {
            $scope.eventSources = [];
            uiCalendarConfig.calendars.myCalendar.fullCalendar("render");
            data = data.map(function (d) {
                if (d.intervenantId) {
                    d.className = 'assertive-bg';
                    if (!d.title) {
                        d.title =  d.intervenantId;
                    }
                }
                else {
                    d.className = 'black-bg';
                }

                //$scope.eventSources.push(d);
                return d;
            });

            if (data.length > 0) {
                uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', {events: data});
            }


            /*
             if (data) {
             $scope.eventSources = data;
             }
             else{
             $scope.eventSources = [];
             }
             */

            //uiCalendarConfig.calendars.modalCalendar.fullCalendar("render");
            console.log(uiCalendarConfig.calendars);

            $timeout(function () {

            }, 250);

        });

    })
    .controller('IntervenantsCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicModal, $timeout, $localstorage, $ionicHistory,
                                              $ionicBackdrop, $ionicLoading, $cordovaGeolocation, $ionicScrollDelegate, $anchorScroll,
                                              $ionicViewSwitcher,
                                              uiCalendarConfig, User, Intervenant, Meeting, Commentaire) {


        moment.locale('fr', {
            months: "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
            monthsShort: "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
            weekdays: "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
            weekdaysShort: "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
            weekdaysMin: "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
            longDateFormat: {
                LT: "HH:mm",
                LTS: "HH:mm:ss",
                L: "DD/MM/YYYY",
                LL: "D MMMM YYYY",
                LLL: "D MMMM YYYY LT",
                LLLL: "dddd D MMMM YYYY LT"
            },
            calendar: {
                sameDay: "[Aujourd'hui à] LT",
                nextDay: '[Demain à] LT',
                nextWeek: 'dddd [à] LT',
                lastDay: '[Hier à] LT',
                lastWeek: 'dddd [dernier à] LT',
                sameElse: 'L'
            },
            relativeTime: {
                future: "dans %s",
                past: "il y a %s",
                s: "quelques secondes",
                m: "une minute",
                mm: "%d minutes",
                h: "une heure",
                hh: "%d heures",
                d: "un jour",
                dd: "%d jours",
                M: "un mois",
                MM: "%d mois",
                y: "une année",
                yy: "%d années"
            },
            ordinalParse: /\d{1,2}(er|ème)/,
            ordinal: function (number) {
                return number + (number === 1 ? 'er' : 'ème');
            },
            meridiemParse: /PD|MD/,
            isPM: function (input) {
                return input.charAt(0) === 'M';
            },
            // in case the meridiem units are not separated around 12, then implement
            // this function (look at locale/id.js for an example)
            // meridiemHour : function (hour, meridiem) {
            //     return /* 0-23 hour, given meridiem token and hour 1-12 */
            // },
            meridiem: function (hours, minutes, isLower) {
                return hours < 12 ? 'h' : 'h';
            },
            week: {
                dow: 1, // Monday is the first day of the week.
                doy: 4  // The week that contains Jan 4th is the first week of the year.
            }
        });


        $scope.User = $localstorage.getObject('User');
        console.log($scope.User._id);


        $scope.showBackButton = true;
        $scope.backButtonLink = "#/app/intervenants/recherche";
        $scope.eventSources = [];

        $scope.uiConfig = {
            calendar: {
                lang: 'fr',
                selectable: true,
                editable: false,
                slotEventOverlap: false,
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
                slotDuration: '01:00:00',
                defaultTimedEventDuration: '01:00:00',
                allDaySlot: false,
                defaultDate: new moment(),
                axisFormat: 'HH',
                selectHelper: true,
                height: 'auto',
                minTime: '08:00:00',

                maxTime: '20:00:00',
                hiddenDays: [0],
                select: function (start, end) {
                    var events = uiCalendarConfig.calendars.modalCalendar.fullCalendar('clientEvents');

                    for (var i in events) {
                        var mStart = new moment(start);
                        var mEnd = new moment(end);
                        if (events[i].start.isBetween(start, end) || events[i].end.isBetween(start, end)
                            || mStart.isBetween(events[i].start, events[i].end) || mEnd.isBetween(events[i].start, events[i].end)
                        ) {
                            uiCalendarConfig.calendars.modalCalendar.fullCalendar('unselect');
                            return alert("Cet horaire n'est pas disponible dans vos agendas communs");
                        }
                    }
                    start.locale('fr');
                    if (confirm('Proposer un rendez-vous à ' + $scope.focusIntervenant.firstname + ' le ' + start.format("D MMM YY") + ' à ' + start.format("HH:mm") + ' ? ')) {
                        var meeting = {
                            beneficiaireId: $scope.User._id,
                            intervenantId: $scope.focusIntervenant._id,
                            start: start,
                            end: end,
                            skill: $scope.search ? $scope.search.skills : null,
                            status: "attente-intervenant",
                            type: "rdv-initial",
                            title: $scope.focusIntervenant.firstname
                        };

                        var m = new Meeting(meeting);
                        m.$save().then(function () {
                            meeting.title = $scope.focusIntervenant.firstname;
                            meeting.className = 'assertive-bg';
                            console.log(meeting);
                            //  uiCalendarConfig.calendars.profileCalendar.fullCalendar('unselect');

                            uiCalendarConfig.calendars.modalCalendar.fullCalendar('renderEvent', meeting, true); // stick? = true
                            alert("Votre demande de rendez vous a bien été transmise à " + $scope.focusIntervenant.firstname + ". Elle vous répondra très rapidement.");
                            $scope.agendaModal.hide();
                        });
                    }
                    uiCalendarConfig.calendars.modalCalendar.fullCalendar('unselect');

                }
            }
        };


        $scope.originalCount = 0;
        $scope.finalCount = 0;
        $scope.doSearch = function () {

            /*$ionicLoading.show({
             template: 'Recherche'
             });*/
            $ionicViewSwitcher.nextDirection('forward');
            $state.go('app.intervenants-resultats', {search: JSON.stringify($scope.search)});
        };


        //Launch the search on the server
        $scope.execSearch = function () {
            console.log("exec search");
            $scope.backButtonLink = "#/app/intervenants/recherche";
            $scope.showBackButton = true;
            console.log($state.params.search, $scope.search);

            $ionicScrollDelegate.scrollTo(0, 0, true);
            if ($state.params.search) {
                $scope.search = JSON.parse($state.params.search);
                $state.params.search = undefined;
            }
            console.log($state.params.search, $scope.search);
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
                $scope.originalCount = $scope.finalCount;
                $scope.finalCount = intervenants.length;
                $localstorage.setObject('intervenants', intervenants);
            });
        };


        // set up meeting between the intervenant and the client

        // Create the profile modal that we will use later
        $ionicModal.fromTemplateUrl('templates/intervenants/profile.html', {
            scope: $scope,
            hideDelay: 220
        }).then(function (modal) {
            $scope.modal = modal;
            $ionicBackdrop.release();
        });

        // Create the modal for the planning
        $ionicModal.fromTemplateUrl('templates/intervenants/agenda.html', {
            scope: $scope,
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
            $anchorScroll('#internenant-' + $scope.focusIntervenant.code);
            //  $ionicScrollDelegate.$getByHandle('#internenant-' + $scope.focusIntervenant.code).anchorScroll();
            $scope.commentaires = Commentaire.query({'query[intervenant]': $scope.focusIntervenant.code});

            $scope.modal.show();
            $ionicBackdrop.release();
            $timeout(function () {
                console.log('test');
                $scope.openAgendaModal(intervenantId);
            }, 1000);

        };

        $scope.closeAgenda = function () {
            $scope.agendaModal.hide();
        };

        $scope.openAgendaModal = function (intervenantId) {
            // $scope.modal.hide();
            console.log(intervenantId);
            for (var i = 0; i < $scope.intervenants.length; i++) {
                if ($scope.intervenants[i]._id === intervenantId) {
                    $scope.focusIntervenant = $scope.intervenants[i];
                    break;
                }
            }
            if (!$scope.focusIntervenant || $scope.focusIntervenant._id !== intervenantId) {

            }
            uiCalendarConfig.calendars.modalCalendar.fullCalendar("render");
            uiCalendarConfig.calendars.modalCalendar.fullCalendar('removeEvents');
            $ionicBackdrop.release();
            $timeout(function () {
                uiCalendarConfig.calendars.modalCalendar.fullCalendar("render");
            }, 500);
            var meetingsList = Meeting.query({'query[intervenantId]': $scope.focusIntervenant._id});
            meetingsList.$promise.then(function (data) {
                $scope.eventSources = [];
                //$scope.agendaModal.show();
                uiCalendarConfig.calendars.modalCalendar.fullCalendar("render");
                data = data.map(function (d) {
                    if (d.beneficiaireId === $scope.User._id) {
                        d.className = 'assertive-bg';
                        d.title = $scope.focusIntervenant.firstname;
                    }
                    else {
                        d.className = 'calm-bg';
                        d.title = $scope.focusIntervenant.firstname + " n'est pas disponible";
                    }
                    //$scope.eventSources.push(d);
                    return d;
                });
                // $ionicLoading.hide();

                if (data.length > 0) {
                    uiCalendarConfig.calendars.modalCalendar.fullCalendar('addEventSource', {events: data});
                }
            });

/*
            var myMeetingsList = Meeting.query({'query[beneficiaireId]': $scope.User._id});
            myMeetingsList.$promise.then(function (data) {
                $scope.eventSources = [];
                //  $scope.agendaModal.show();
                uiCalendarConfig.calendars.modalCalendar.fullCalendar("render");
                var events = [];

                for (var i in data) {
                    var d = data[i];
                    if (d.intervenantId) {
                        d.className = 'assertive-bg';
                        if (d.intervenantId === $scope.focusIntervenant._id) {
                            continue;
                        }
                    }
                    else {
                        d.className = 'calm-bg';
                        d.title = "Vous n'est pas disponible";
                    }
                    //$scope.eventSources.push(d);
                    return d;
                }


                if (data.length > 0) {
                    uiCalendarConfig.calendars.modalCalendar.fullCalendar('addEventSource', {events: data});
                }


                //uiCalendarConfig.calendars.modalCalendar.fullCalendar("render");
                console.log(uiCalendarConfig.calendars);

                $timeout(function () {

                }, 250);

            });
*/

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
                var interv = $scope.intervenants[i];
                var latlng = new google.maps.LatLng(interv.location.lat, interv.location.lng);
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: $scope.map,
                    animation: google.maps.Animation.DROP,
                    title: interv.firstname,
                    icon: '/img/intervenants/map-' + interv.firstname.toLowerCase() + '-' + ($scope.focusIntervenant._id === interv._id ? 'rose' : 'bleu') + '.png'
                });
                google.maps.event.addListener(marker, 'click', function () {
                    $scope.openProfileModal(interv._id);
                });
            }
        }
    });

