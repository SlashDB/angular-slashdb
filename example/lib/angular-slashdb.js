(function () {
    'use strict';
    var SlashDBService = (function () {
        function SlashDBService($http, $q, $cookies, $rootScope, config) {
            this.$http = $http;
            this.$q = $q;
            this.$cookies = $cookies;
            this.$rootScope = $rootScope;
            this.config = config;
            this.settings = { user: '' };
            if (this.isAuthenticated() && this.settings.user == '') {
                this.getSettings();
            }
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
        SlashDBService.prototype.subscribe = function (scope, eventName, callback) {
            var handler = this.$rootScope.$on(eventName, callback);
            scope.$on('$destroy', handler);
        };
        SlashDBService.prototype.subscribeLogin = function (scope, callback) {
            this.subscribe(scope, 'slashdb-service-login-event', callback);
        };
        SlashDBService.prototype.notifyLogin = function () {
            return this.$rootScope.$emit('slashdb-service-login-event');
        };
        SlashDBService.prototype.subscribeLogout = function (scope, callback) {
            this.subscribe(scope, 'slashdb-service-logout-event', callback);
        };
        SlashDBService.prototype.notifyLogout = function () {
            return this.$rootScope.$emit('slashdb-service-logout-event');
        };
        SlashDBService.prototype.subscribeSettingsChange = function (scope, callback) {
            this.subscribe(scope, 'slashdb-service-settings-update-event', callback);
        };
        SlashDBService.prototype.notifySettingsChange = function () {
            return this.$rootScope.$emit('slashdb-service-settings-update-event');
        };
        SlashDBService.prototype.getSettings = function () {
            var _this = this;
            var requetUrl = this.getUrl('/settings.json');
            return this.$http.get(requetUrl)
                .then(function (response) {
                angular.extend(_this.settings, response.data);
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
                _this.notifyLogin();
                return _this.getSettings();
            });
        };
        SlashDBService.prototype.logout = function () {
            var _this = this;
            var requetUrl = this.getUrl('/logout');
            return this.$http.get(requetUrl)
                .finally(function () {
                _this.$cookies.remove('auth_tkt');
                _this.notifyLogout();
                return _this.getSettings();
            });
        };
        SlashDBService.prototype.isAuthenticated = function () {
            return this.$cookies.get('auth_tkt') != null;
        };
        SlashDBService.prototype.updateRequestConfig = function (userRequestConfig) {
            return angular.extend({}, this.config.httpRequestConfig, userRequestConfig);
        };
        SlashDBService.prototype.executeQuery = function (url, userRequestConfig, asArray) {
            var _this = this;
            if (userRequestConfig === void 0) { userRequestConfig = {}; }
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
                var requestConfig = this.updateRequestConfig(userRequestConfig);
                promise = this.$http.get(sdbUrl, requestConfig)
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
        SlashDBService.prototype.get = function (url, userRequestConfig, asArray) {
            var _this = this;
            if (userRequestConfig === void 0) { userRequestConfig = {}; }
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
                var requestConfig = this.updateRequestConfig(userRequestConfig);
                promise = this.$http.get(sdbUrl, requestConfig)
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
        SlashDBService.prototype.post = function (url, data, userRequestConfig) {
            if (userRequestConfig === void 0) { userRequestConfig = {}; }
            var sdbUrl = this.getUrl(url);
            var requestConfig = this.updateRequestConfig(userRequestConfig);
            return this.$http.post(sdbUrl, data, requestConfig);
        };
        SlashDBService.prototype.put = function (url, data, userRequestConfig) {
            if (userRequestConfig === void 0) { userRequestConfig = {}; }
            var sdbUrl = this.getUrl(url);
            var requestConfig = this.updateRequestConfig(userRequestConfig);
            return this.$http.put(sdbUrl, data, requestConfig);
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
                    headers: {},
                    params: {}
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
        SlashDBServiceProvider.prototype.setParams = function (params) {
            this.config.httpRequestConfig.params = params;
        };
        SlashDBServiceProvider.prototype.$get = function ($http, $q, $cookies, $rootScope) {
            return new SlashDBService($http, $q, $cookies, $rootScope, this.config);
        };
        return SlashDBServiceProvider;
    }());
    angular.module('angularSlashDB', ['ngCookies'])
        .provider('slashDB', new SlashDBServiceProvider());
})();
