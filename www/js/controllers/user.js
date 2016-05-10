angular.module('colette.controllers').controller('UserCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicModal, $timeout, $localstorage, $ionicHistory,
                                  $ionicBackdrop, $ionicLoading, $cordovaGeolocation, $ionicScrollDelegate,
                                  $ionicViewSwitcher, $ionicPopup,
                                  uiCalendarConfig, User, Intervenant, Meeting, Commentaire) {

    $rootScope.showBackButton = true;

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
    $scope.eventSources = [];


    $scope.intervenants = Intervenant.query({});


    var createPrivateEvent = function (start, end) {
        console.log('my calendar event');
        var events = uiCalendarConfig.calendars.myCalendar.fullCalendar('clientEvents');

        start.locale('fr');

        if ($state.params.intervenantId) {
            for (var i in events) {
                var mStart = new moment(start);
                var mEnd = new moment(end);
                if (events[i].start.isBetween(start, end) || events[i].end.isBetween(start, end)
                    || mStart.isBetween(events[i].start, events[i].end) || mEnd.isBetween(events[i].start, events[i].end)
                ) {
                    uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
                    $ionicPopup.alert({
                        title: 'Bonjour Colette',
                        template: "Cet horaire n'est pas disponible dans vos agendas communs",
                        buttons: [{
                            text: "OK",
                            type: 'button-assertive'
                        }]
                    });

                }
            }


            var texte = 'Proposer un rendez-vous à ' + $state.params.firstname + ' le ' + start.format("D MMM YY") + ' à ' + start.format("HH:mm") + ' ? ';
            var confirmPopup = $ionicPopup.confirm({
                title: 'Bonjour Colette',
                template: texte,
                okText: "OK",
                okType: 'button-assertive',
                cancelText: "Annuler"
            });

            confirmPopup.then(function (resp) {
                if (resp) {
                    var meeting = {
                        beneficiaireId: $scope.User._id,
                        intervenantId: $state.params.intervenantId,
                        start: start,
                        end: end,
                        skill: $scope.search ? $scope.search.skills : null,
                        status: "attente-intervenant",
                        type: "rdv-initial",
                        title: $state.params.firstname
                    };

                    var m = new Meeting(meeting);
                    m.$save().then(function () {
                        meeting.title = $state.params.firstname;
                        meeting.className = 'assertive-bg';
                        console.log(meeting);
                        //  uiCalendarConfig.calendars.profileCalendar.fullCalendar('unselect');

                        uiCalendarConfig.calendars.myCalendar.fullCalendar('renderEvent', meeting, true); // stick? = true
                        var txt = "<center>Votre demande de rendez-vous vient d'être envoyée. <br><br>" +
                        "Vous serez prévenu sur votre application dès que " + $state.params.firstname +
                            " aura accepté ou refusé votre proposition de rendez-vous.<br/><br/> Vous pourrez alors " +
                            "prendre contact avec elle pour plus de précisions</center>";
                        $ionicPopup.alert({
                            title: "Bonjour Colette", template: txt, buttons: [{
                                text: "RETOUR A VOTRE RECHERCHE",
                                type: 'button-assertive'
                            }]
                        });
                    });
                }
            });
        }
        else {


            var texte = 'Rendre le créneau de ' + start.format("HH:mm") + ' à ' + end.format("HH:mm") + ' indisponible dans votre calendrier ?';
            var confirmPopup = $ionicPopup.confirm({
                title: 'Bonjour Colette', template: texte,
                okText: "OK",
                okType: 'button-assertive',
                cancelText: "Annuler"
            });


            confirmPopup.then(function (res) {
                if (res) {
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
                        uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');

                        uiCalendarConfig.calendars.myCalendar.fullCalendar('renderEvent', meeting, true); // stick? = true
                        $ionicPopup.alert({
                            title: 'Bonjour Colette', template: 'Votre créneau a bien été vérouillé.', buttons: [{
                                text: "OK",
                                type: 'button-assertive'
                            }]
                        });
                    });
                }
            });
            uiCalendarConfig.calendars.myCalendar.fullCalendar('unselect');
        }

    };

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
            select: createPrivateEvent
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
                    d.title = d.intervenantId;
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


    if ($state.params.intervenantId) {
        console.log($state.params);
        $scope.intervenant = {_id: $state.params.intervenantId, firstname: $state.params.firstname};
        var IntervenantMeetingsList = Meeting.query({'query[intervenantId]': $state.params.intervenantId});
        IntervenantMeetingsList.$promise.then(function (data) {
            $scope.eventSources = [];
            uiCalendarConfig.calendars.myCalendar.fullCalendar("render");
            data = data.map(function (d) {
                if (d.intervenantId && d.beneficiaireId === $scope.User._id) {
                    d.className = 'assertive-bg';
                }
                else {
                    d.className = 'calm-bg';
                    d.title = $state.params.firstname + " n'est pas disponible";
                }
                return d;
            });

            if (data.length > 0) {
                uiCalendarConfig.calendars.myCalendar.fullCalendar('addEventSource', {events: data});
            }

        });


    }

})