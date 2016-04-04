angular.module('colette.services', ['ngResource'])
    .factory('$localstorage', ['$window', function($window) {
        return {
            set: function(key, value) {
                $window.localStorage[key] = value;
            },
            get: function(key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function(key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        }
    }])
    .factory('Intervenant', function($resource, CONFIG) {
        return $resource(CONFIG.baseUrl + '/intervenant/:id', {_id:'@id'},
            { "update": {isArray: false, method:"PUT", transformResponse: function(data,headersGetter){return data.body;}},
                "query": {isArray: true, cancellable: false, method:"GET", transformResponse: transformGet}
            } );

    })
    .factory('Meeting', function($resource, CONFIG) {
        return $resource(CONFIG.baseUrl + '/meeting/:id', {_id:'@id'},
            { "update": {isArray: false, method:"PUT", transformResponse: function(data,headersGetter){return data.body;}},
                "query": {isArray: true, cancellable: false, method:"GET", transformResponse: transformGet}
            } );

    })
    .factory('Meeting', function($resource, CONFIG) {
        return $resource(CONFIG.baseUrl + '/meeting/:id', {_id:'@id'},
            { "update": {isArray: false, method:"PUT", transformResponse: function(data,headersGetter){return data.body;}},
                "query": {isArray: true, cancellable: false, method:"GET", transformResponse: transformGet}
            } );

    })
    .factory('User', function($resource, CONFIG) {
        return $resource(CONFIG.baseUrl + '/user');
    });

function transformGet(json, headerGetter) {
    return angular.fromJson(json).body;
}