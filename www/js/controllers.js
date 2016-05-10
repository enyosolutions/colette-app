angular
    .module('colette.controllers', [])
    .run(function ($rootScope, $timeout, $state, $localstorage, Intervenant) {
        $rootScope.menuScrollLeft = function () {
            return;
        };

        $rootScope.menuScrollRight = function (evt) {
        };


        /*        setTimeout(function () {
         console.log($state.current.name);
         console.log('going home');
         $state.go('app.home');

         }, 20000);*/


        if ($localstorage.getObject('User')) {
            //$state.go('app.home');
        }

        var intervenantsQuery = Intervenant.query();
        intervenantsQuery.$promise.then(function (intervenants) {
            $localstorage.setObject('intervenantsFullList', intervenants);
        });

    });

