/**
 * Created by vjain3 on 3/22/16.
 */
angular.module('contiv.models')
    .factory('NodesModel', ['$http', '$q', function ($http, $q) {
        var nodesmodel = new NodesCollection($http, $q);
        return nodesmodel;
    }]);

function NodesCollection($http, $q) {
    var nodescollection = this,
        models;

    function extract(result) {
        //Convert to array if the returned collection is not an array
        return _.map(result.data, function (value, key) {
            value.key = key;
            return value;
        });
    }

    function cache(result) {
        models = extract(result);
        return models;
    }

    nodescollection.get = function (reload) {
        if (reload === undefined) reload = false;
        return (!reload && models) ? $q.when(models) : $http.get(ContivGlobals.NODES_LIST_ENDPOINT).then(cache);
    };

    nodescollection.getModelByKey = function (key, reload) {
        if (reload === undefined) reload = false;

        var deferred = $q.defer();

        function findModel() {
            return _.find(models, function (c) {
                return c.key == key;
            })
        }

        if (!reload && models) {
            deferred.resolve(findModel());
        } else {
            nodescollection.get(reload)
                .then(function () {
                    deferred.resolve(findModel());
                });
        }

        return deferred.promise;
    };

    /**
     *
     * @param key
     * @param extraVars JSON object of extra ansible and environment variables to be passed while commissioning a node
     * {
     * "env":{"http_proxy":"http://proxy.esl.cisco.com:8080", "https_proxy":"http://proxy.esl.cisco.com:8080"},
     * "control_interface": "eth1", "service_vip": "192.168.2.252", "validate_certs": "false", "netplugin_if" : "eth2"
     * }
     * @returns {*}
     */
    nodescollection.commission = function (key, extraVars) {
        var deferred = $q.defer();
        var queryString = 'extra_vars=' + JSON.stringify(extraVars);
        var url = ContivGlobals.NODES_COMMISSION_ENDPOINT + key + '?' + queryString;
        $http.post(url, {}, {
                'headers': {
                    'Content-Type': 'application/json'
                }
            })
            .then(function successCallback(response) {
                //Server doesn't return any json in response
                deferred.resolve();
            }, function errorCallback(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    nodescollection.decommission = function (key) {
        var deferred = $q.defer();
        var url = ContivGlobals.NODES_DECOMMISSION_ENDPOINT + key;
        $http.post(url, {}, {
                'headers': {
                    'Content-Type': 'application/json'
                }
            })
            .then(function successCallback(response) {
                deferred.resolve();
            }, function errorCallback(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    nodescollection.upgrade = function (key) {
        var deferred = $q.defer();
        var url = ContivGlobals.NODES_MAINTENANCE_ENDPOINT + key;
        $http.post(url, {}, {
                'headers': {
                    'Content-Type': 'application/json'
                }
            })
            .then(function successCallback(response) {
                deferred.resolve();
            }, function errorCallback(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };

    /**
     *
     * @param ip
     * @param extraVars JSON object of extra ansible and environment variables to be passed while discovering a node
     * {
     * "env":{"http_proxy":"http://proxy.esl.cisco.com:8080", "https_proxy":"http://proxy.esl.cisco.com:8080"},
     * "control_interface": "eth1", "service_vip": "192.168.2.252", "cluster-name": "contiv", "node-label" : "node1"
     * }
     * @returns {*}
     */
    nodescollection.discover = function (ip, extraVars) {
        var deferred = $q.defer();
        var queryString = 'extra_vars=' + JSON.stringify(extraVars);
        var url = ContivGlobals.NODES_DISCOVER_ENDPOINT + ip + '?' + queryString;
        $http.post(url, {}, {
                'headers': {
                    'Content-Type': 'application/json'
                }
            })
            .then(function successCallback(response) {
                deferred.resolve();
            }, function errorCallback(response) {
                deferred.reject(response);
            });
        return deferred.promise;
    };
}