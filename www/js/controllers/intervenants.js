angular.module('colette.controllers').controller('IntervenantsCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicModal, $timeout, $localstorage, $ionicHistory,
                                                 $ionicBackdrop, $ionicLoading, $cordovaGeolocation, $ionicScrollDelegate, $anchorScroll, $ionicPosition,
                                                 $ionicViewSwitcher, $ionicPopup,
                                                 uiCalendarConfig, User, Intervenant, Meeting, Commentaire) {




        // CALENDAR IN FRENCH
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
        $scope.disclaimerMode = false;
        $scope.hideBackButton = true;
        $scope.backButtonLink = "#/app/intervenants/recherche";

        // CONFIGURATION FOR THE CALENDAR
        $scope.eventSources = [];


        $scope.uiConfig = {
            calendar: {
                lang: 'fr',
                selectable: false,
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
                hiddenDays: [0]
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
            hideDelay: 0
        }).then(function (modal) {
            $scope.modal = modal;
            $ionicBackdrop.release();
        });

        // Create the modal for the planning
        $ionicModal.fromTemplateUrl('templates/intervenants/agenda.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.agendaModal = modal;
            $ionicBackdrop.release();
        });

        $scope.openProfileModal = function (intervenantId) {
            $scope.disclaimerMode = false;
            if (!$scope.focusIntervenant || $scope.focusIntervenant._id !== intervenantId) {
                for (var i in $scope.intervenants) {
                    if ($scope.intervenants[i]._id === intervenantId) {
                        $scope.focusIntervenant = $scope.intervenants[i];
                    }
                }
            }

            $scope.scrollToSection('intervenant-' + $scope.focusIntervenant.code, 'intervenants-handle');
            $scope.commentaires = Commentaire.query({'query[intervenant]': $scope.focusIntervenant.code});

            $scope.modal.show();
            $ionicBackdrop.release();
            $timeout(function () {
                $scope.openAgendaModal($scope.focusIntervenant._id);
            }, 300);

        };

        $scope.scrollToSection = function (section, handle) {
            console.log(section);
            var quotePosition = $ionicPosition.position(angular.element(document.getElementById(section)));
            console.log(quotePosition.top);

            // if there is no handle, use the profile page handle
            if (handle) {
                $ionicScrollDelegate.$getByHandle(handle).scrollTo(quotePosition.left, quotePosition.top, true);
            }
            else {
                $ionicScrollDelegate.scrollTo(quotePosition.left, quotePosition.top, true);
            }

        };

        $scope.showDisclaimer = function () {
            $scope.disclaimerMode = true;
        };
        $scope.closeDisclaimer = function () {
            $scope.disclaimerMode = false;
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

        var location = {lat: 48.8588377, lng: 2.2775169};
        $scope.User = $localstorage.getObject('User');
        if ($scope.User.location) {
            location = $scope.User.location;
        }

        var myLatLng = new google.maps.LatLng(location.lat, location.lng);

        var mapOptions = {
            center: myLatLng,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };


        $scope.openMap = function (intervenantId) {
            $localstorage.set('map-intervenant-id', intervenantId);

            var intervenantsFull = $localstorage.getObject('intervenantsFullList');

            for (var i in intervenantsFull) {
                console.log(intervenantsFull[i]._id);
                if (intervenantId === intervenantsFull[i]._id) {
                    $scope.focusIntervenant = intervenantsFull[i];
                }

            }
            setMapCenter($scope.focusIntervenant.location.lat, $scope.focusIntervenant.location.lng);
            $scope.closeModal();
            // $timeout(function(){google.maps.event.trigger($scope.map, 'resize');},3000);
            $state.go('app.intervenants-map-user');
        }

        var setMapCenter = function (lat, lng) {
            if ($scope.map) {
                $scope.map.center.latitude = location.lat;
                $scope.map.center.longitude = location.lng;
                $timeout(function () {
                    $scope.$apply();
                }, 1000);
            }
        };


        if ($state.is('app.intervenants-map-user') || $state.is('app.intervenants-map') || $state.is('app.intervenants-agenda')) {
            if (!$scope.mapInitialized) {
                console.log('******Map init');
                console.log('******Map init');
                console.log('******Map init');
                $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
                $scope.mapInitialized = true;
            }
            else {
                console.log('******ALREADY init');
                console.log('******ALREADY init');
                console.log('******ALREADY init');
            }

            var intervenantId = $localstorage.get('map-intervenant-id', intervenantId);
            $scope.intervenants = $localstorage.getObject('intervenants');
            var intervenantsFull = $localstorage.getObject('intervenantsFullList');

            for (var i in intervenantsFull) {
                console.log(intervenantsFull[i]._id);
                if (intervenantId === intervenantsFull[i]._id) {
                    $scope.focusIntervenant = intervenantsFull[i];
                }

            }

            console.log($scope.focusIntervenant.firstname);
            if (!$scope.focusIntervenant) {
                return
            }
            setMapCenter($scope.focusIntervenant.location.lat, $scope.focusIntervenant.location.lng);
            location = $scope.focusIntervenant.location;


            if ($scope.markers) {
                for (var i = 0; i < markers.length; i++) {
                    $scope.markers.setMap(null);
                }
            }
            $scope.markers = [];

            console.log($scope.map);

            var marker = new google.maps.Marker({
                position: myLatLng,
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
    }
)
;