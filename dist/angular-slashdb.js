(function () {
    'use strict';
    var SlashDBService = (function () {
        function SlashDBService($http, $q, $cookies, $rootScope, config) {
            this.$http = $http;
            this.$q = $q;
            this.$cookies = $cookies;
            this.$rootScope = $rootScope;
            this.config = config;
            this.settings = { loggedInUser: '' };
            if (window.sessionStorage != null) {
                this.storage = window.sessionStorage;
            }
            else {
                var storage_1 = {
                    data: {},
                    setItem: function (key, value) {
                        storage_1.data[key] = value;
                    },
                    getItem: function (key) {
                        return storage_1.data[key];
                    }
                };
                this.storage = storage_1;
            }
        }
        SlashDBService.prototype.getUrl = function (url) {
            return "" + this.config.endpoint + url;
        };
        SlashDBService.prototype.notifySettingsChange = function () {
            return this.$rootScope.$emit('slashdb-service-settings-update-event');
        };
        SlashDBService.prototype.getSettings = function () {
            var _this = this;
            var requetUrl = this.getUrl('/settings.json');
            return this.$http.get(requetUrl)
                .then(function (response) {
                _this.settings = angular.copy(response.data);
                _this.notifySettingsChange();
                return _this.settings;
            });
        };
        SlashDBService.prototype.login = function (user, password) {
            var _this = this;
            var requetUrl = this.getUrl('/login');
            return this.$http.post(requetUrl, { login: user, password: password })
                .then(function (response) {
                _this.$cookies.put('auth_tkt_user', user);
                return _this.getSettings();
            });
        };
        SlashDBService.prototype.logout = function () {
            var _this = this;
            var requetUrl = this.getUrl('/logout');
            return this.$http.get(requetUrl)
                .finally(function () {
                _this.$cookies.remove('auth_tkt');
                return _this.getSettings();
            });
        };
        SlashDBService.prototype.executeQuery = function (url, asArray) {
            var _this = this;
            if (asArray === void 0) { asArray = true; }
            var sdbUrl = this.config.endpoint + "/query" + url;
            var promise;
            var data;
            if (this.config.cacheData && this.storage.getItem(sdbUrl) != null) {
                promise = this.$q(function (resolve, reject) {
                    data = JSON.parse(_this.storage.getItem(sdbUrl));
                    resolve(data);
                });
            }
            else {
                promise = this.$http.get(sdbUrl, this.config.httpRequestConfig)
                    .then(function (response) {
                    data = (!Array.isArray(response.data) && asArray) ? [response.data] : data = response.data;
                    if (_this.config.cacheData) {
                        _this.storage.setItem(sdbUrl, JSON.stringify(data));
                    }
                    return data;
                }, function (response) { return _this.$q.reject(response.data); });
            }
            return promise;
        };
        SlashDBService.prototype.subscribe = function (scope, callback) {
            var handler = this.$rootScope.$on('slashdb-service-settings-update-event', callback);
            scope.$on('$destroy', handler);
        };
        SlashDBService.prototype.get = function (url, asArray) {
            var _this = this;
            if (asArray === void 0) { asArray = true; }
            var sdbUrl = this.getUrl(url);
            var promise;
            var data;
            if (this.config.cacheData && this.storage.getItem(sdbUrl) != null) {
                promise = this.$q(function (resolve, reject) {
                    data = JSON.parse(_this.storage.getItem(sdbUrl));
                    resolve(data);
                });
            }
            else {
                promise = this.$http.get(sdbUrl, this.config.httpRequestConfig)
                    .then(function (response) {
                    if (Array.isArray(response.data)) {
                        data = asArray ? response.data : response.data[0];
                    }
                    else {
                        data = asArray ? [response.data] : response.data;
                    }
                    if (_this.config.cacheData) {
                        _this.storage.setItem(sdbUrl, JSON.stringify(data));
                    }
                    return data;
                }, function (response) { return _this.$q.reject(response.data); });
            }
            return promise;
        };
        SlashDBService.prototype.post = function (url, data) {
            var sdbUrl = this.getUrl(url);
            return this.$http.post(sdbUrl, data, this.config.httpRequestConfig);
        };
        SlashDBService.$inject = ['$http', '$q', '$cookies', '$rootScope'];
        return SlashDBService;
    }());
    var SlashDBServiceProvider = (function () {
        function SlashDBServiceProvider() {
            this.config = {
                endpoint: 'http://localhost',
                cacheData: false,
                httpRequestConfig: {
                    headers: {}
                }
            };
        }
        SlashDBServiceProvider.prototype.setEndpoint = function (endpoint) {
            this.config.endpoint = endpoint;
        };
        SlashDBServiceProvider.prototype.setCacheData = function (cacheData) {
            this.config.cacheData = cacheData;
        };
        SlashDBServiceProvider.prototype.setHeaders = function (headers) {
            this.config.httpRequestConfig.headers = headers;
        };
        SlashDBServiceProvider.prototype.$get = function ($http, $q, $cookies, $rootScope) {
            var config = angular.copy(this.config);
            return new SlashDBService($http, $q, $cookies, $rootScope, config);
        };
        return SlashDBServiceProvider;
    }());
    angular.module('angularSlashDB', ['ngCookies'])
        .provider('slashDB', new SlashDBServiceProvider());
})();
