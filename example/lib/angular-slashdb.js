(function () {
    'use strict';
    var SlashDBService = (function () {
        function SlashDBService($http, $q, $cookies, $rootScope, config) {
            this.$http = $http;
            this.$q = $q;
            this.$cookies = $cookies;
            this.$rootScope = $rootScope;
            this.config = config;
            this.settings = {};
            this.dbDefs = {};
            this.userDefs = {};
            this.queryDefs = {};
            this.getSettings();
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
        SlashDBService.prototype.escapeValue = function (value) {
            for (var key in this.settings.reversed_url_substitution) {
                if (this.settings.reversed_url_substitution.hasOwnProperty(key)) {
                    var substitution = this.settings.reversed_url_substitution[key];
                    value = value.split(key).join(substitution);
                }
            }
            return value;
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
            return this.get('/settings.json').then(function (response) {
                if (response.status == 200) {
                    angular.extend(_this.settings, response.data[0]);
                    _this.notifySettingsChange();
                }
                return response;
            });
        };
        SlashDBService.prototype.login = function (user, password) {
            var _this = this;
            var data = { login: user, password: password };
            return this.post('/login', data).then(function (response) {
                if (!_this.config.httpRequestConfig.withCredentials) {
                    angular.extend(_this.config.httpRequestConfig.params, _this.config.apiKeys);
                    localStorage.setItem('apiKeys', JSON.stringify(_this.config.apiKeys));
                }
                _this.notifyLogin();
                _this.getSettings();
                return response;
            });
        };
        SlashDBService.prototype.logout = function () {
            var _this = this;
            var handler = function (response) {
                if (_this.config.httpRequestConfig.withCredentials) {
                    _this.$cookies.remove('auth_tkt');
                }
                else {
                    var tmp = Object.keys(_this.config.apiKeys);
                    for (var i = 0, tmpl = tmp.length; i < tmpl; i++) {
                        delete _this.config.httpRequestConfig.params[tmp[i]];
                    }
                    localStorage.removeItem('apiKeys');
                }
                _this.notifyLogout();
                _this.getSettings();
            };
            return this.get('/logout', {}, true).then(handler, handler);
        };
        SlashDBService.prototype.isAuthenticated = function () {
            if (this.config.httpRequestConfig.withCredentials) {
                return this.$cookies.get('auth_tkt') != null || (this.settings.user != null && this.settings.user != '');
            }
            var tmp = Object.keys(this.config.apiKeys), tmpl = tmp.length, k, v;
            if (tmpl > 0) {
                for (var i = 0; i < tmpl; i++) {
                    k = tmp[i];
                    v = this.config.httpRequestConfig.params[k];
                    if (v == null && v != this.config.apiKeys[k]) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        SlashDBService.prototype.uploadLicense = function (licFile) {
            var fd = new FormData();
            var userRequestConfig = { transformRequest: angular.identity, headers: { 'Content-Type': undefined } };
            fd.append('license', licFile);
            return this.post('/license', fd, userRequestConfig);
        };
        SlashDBService.prototype.loadModel = function (dbName) {
            return this.get("/load-model/" + dbName + ".json");
        };
        SlashDBService.prototype.unloadModel = function (dbName) {
            return this.get("/unload-model/" + dbName + ".json");
        };
        SlashDBService.prototype.getDBDefs = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            var promise;
            var response;
            if (this.config.cacheData && !force && Object.keys(this.dbDefs).length > 0) {
                promise = this.$q(function (resolve, reject) {
                    response = { data: _this.dbDefs };
                    resolve(response);
                });
            }
            else {
                promise = this.get('/dbdef.json').then(function (response) {
                    if (response.status == 200) {
                        this.dbDefs = response.data;
                    }
                    return response;
                });
            }
            return promise;
        };
        SlashDBService.prototype.getDBDef = function (dbName, force) {
            var _this = this;
            if (force === void 0) { force = false; }
            var promise;
            var response;
            if (this.config.cacheData && !force && this.dbDefs[dbName] != null) {
                promise = this.$q(function (resolve, reject) {
                    response = { data: _this.dbDefs[dbName] };
                    resolve(response);
                });
            }
            else {
                promise = this.get("/dbdef/" + dbName + ".json");
            }
            return promise;
        };
        SlashDBService.prototype.createDBDef = function (dbName, data) {
            var sdbUrl = "/dbdef/" + dbName + ".json";
            return this.post(sdbUrl, data);
        };
        SlashDBService.prototype.updateDBDef = function (dbName, data) {
            var sdbUrl = "/dbdef/" + dbName + ".json";
            return this.put(sdbUrl, data);
        };
        SlashDBService.prototype.deleteDBDef = function (dbName) {
            var sdbUrl = "/dbdef/" + dbName + ".json";
            return this.delete(sdbUrl);
        };
        SlashDBService.prototype.getUserDefs = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            var promise;
            var response;
            if (this.config.cacheData && !force && Object.keys(this.userDefs).length > 0) {
                promise = this.$q(function (resolve, reject) {
                    response = { data: _this.userDefs };
                    resolve(response);
                });
            }
            else {
                promise = this.get('/userdef.json').then(function (response) {
                    if (response.status == 200) {
                        this.userDefs = response.data;
                    }
                    return response;
                });
            }
            return promise;
        };
        SlashDBService.prototype.getUserDef = function (userName, force) {
            var _this = this;
            if (force === void 0) { force = false; }
            var promise;
            var response;
            if (this.config.cacheData && !force && this.userDefs[userName] != null) {
                promise = this.$q(function (resolve, reject) {
                    response = { data: _this.userDefs[userName] };
                    resolve(response);
                });
            }
            else {
                promise = this.get("/userdef/" + userName + ".json");
            }
            return promise;
        };
        SlashDBService.prototype.createUserDef = function (userName, data) {
            var sdbUrl = "/userdef/" + userName + ".json";
            return this.post(sdbUrl, data);
        };
        SlashDBService.prototype.updateUserDef = function (userName, data) {
            var sdbUrl = "/userdef/" + userName + ".json";
            return this.put(sdbUrl, data);
        };
        SlashDBService.prototype.deleteUserDef = function (userName) {
            var sdbUrl = "/userdef/" + userName + ".json";
            return this.delete(sdbUrl);
        };
        SlashDBService.prototype.getQueryDefs = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            var promise;
            var response;
            if (this.config.cacheData && !force && Object.keys(this.queryDefs).length > 0) {
                promise = this.$q(function (resolve, reject) {
                    response = { data: _this.queryDefs };
                    resolve(response);
                });
            }
            else {
                promise = this.get('/querydef.json').then(function (response) {
                    if (response.status == 200) {
                        this.queryDefs = response.data;
                    }
                    return response;
                });
            }
            return promise;
        };
        SlashDBService.prototype.getQueryDef = function (queryName, force) {
            var _this = this;
            if (force === void 0) { force = false; }
            var promise;
            var response;
            if (this.config.cacheData && !force && this.queryDefs[queryName] != null) {
                promise = this.$q(function (resolve, reject) {
                    response = { data: _this.queryDefs[queryName] };
                    resolve(response);
                });
            }
            else {
                promise = this.get("/querydef/" + queryName + ".json");
            }
            return promise;
        };
        SlashDBService.prototype.createQueryDef = function (queryName, data) {
            var sdbUrl = "/querydef/" + queryName + ".json";
            return this.post(sdbUrl, data);
        };
        SlashDBService.prototype.updateQueryDef = function (queryName, data) {
            var sdbUrl = "/querydef/" + queryName + ".json";
            return this.put(sdbUrl, data);
        };
        SlashDBService.prototype.deleteQueryDef = function (queryName) {
            var sdbUrl = "/querydef/" + queryName + ".json";
            return this.delete(sdbUrl);
        };
        SlashDBService.prototype.updateRequestConfig = function (userRequestConfig) {
            return angular.merge({}, this.config.httpRequestConfig, userRequestConfig);
        };
        SlashDBService.prototype.getQueries = function (force) {
            var _this = this;
            if (force === void 0) { force = false; }
            var promise;
            var response;
            if (this.config.cacheData && !force && this.passThruQueries != null) {
                promise = this.$q(function (resolve, reject) {
                    response = { data: _this.passThruQueries };
                    resolve(response);
                });
            }
            else {
                promise = this.get('/query.json').then(function (response) {
                    if (response.status == 200) {
                        this.passThruQueries = response.data;
                    }
                    return response;
                });
            }
            return promise;
        };
        SlashDBService.prototype.executeQuery = function (url, userRequestConfig, force, asArray) {
            var _this = this;
            if (userRequestConfig === void 0) { userRequestConfig = {}; }
            if (force === void 0) { force = false; }
            if (asArray === void 0) { asArray = true; }
            var sdbUrl = this.config.endpoint + "/query" + url;
            var promise;
            var data, response;
            if (this.config.cacheData && !force && this.storage.getItem(sdbUrl) != null) {
                promise = this.$q(function (resolve, reject) {
                    response = JSON.parse(_this.storage.getItem(sdbUrl));
                    resolve(response);
                });
            }
            else {
                var requestConfig = this.updateRequestConfig(userRequestConfig);
                promise = this.$http.get(sdbUrl, requestConfig)
                    .then(function (response) {
                    if (response.status == 200) {
                        data = (!Array.isArray(response.data) && asArray) ? [response.data] : response.data;
                        response.data = data;
                        if (_this.config.cacheData) {
                            _this.storage.setItem(sdbUrl, JSON.stringify(response));
                        }
                    }
                    return response;
                });
            }
            return promise;
        };
        SlashDBService.prototype.get = function (url, userRequestConfig, force, asArray) {
            var _this = this;
            if (userRequestConfig === void 0) { userRequestConfig = {}; }
            if (force === void 0) { force = false; }
            if (asArray === void 0) { asArray = true; }
            var sdbUrl = this.getUrl(url);
            var promise;
            var data, response;
            if (this.config.cacheData && !force && this.storage.getItem(sdbUrl) != null) {
                promise = this.$q(function (resolve, reject) {
                    response = JSON.parse(_this.storage.getItem(sdbUrl));
                    resolve(response);
                });
            }
            else {
                var requestConfig = this.updateRequestConfig(userRequestConfig);
                promise = this.$http.get(sdbUrl, requestConfig)
                    .then(function (response) {
                    if (response.status == 200) {
                        if (Array.isArray(response.data)) {
                            data = asArray ? response.data : response.data[0];
                        }
                        else {
                            data = asArray ? [response.data] : response.data;
                        }
                        response.data = data;
                        if (_this.config.cacheData) {
                            _this.storage.setItem(sdbUrl, JSON.stringify(response));
                        }
                    }
                    return response;
                });
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
        SlashDBService.prototype.delete = function (url, userRequestConfig) {
            if (userRequestConfig === void 0) { userRequestConfig = {}; }
            var sdbUrl = this.getUrl(url);
            var requestConfig = this.updateRequestConfig(userRequestConfig);
            return this.$http.delete(sdbUrl, requestConfig);
        };
        SlashDBService.$inject = ['$http', '$q', '$cookies', '$rootScope'];
        return SlashDBService;
    }());
    var SlashDBServiceProvider = (function () {
        function SlashDBServiceProvider() {
            this.config = {
                endpoint: '',
                cacheData: false,
                apiKeys: {},
                httpRequestConfig: {
                    headers: {},
                    params: {},
                    withCredentials: true
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
        SlashDBServiceProvider.prototype.setWithCredentials = function (newValue) {
            this.config.httpRequestConfig.withCredentials = newValue;
        };
        SlashDBServiceProvider.prototype.setAPIKeys = function (apiKeysObj) {
            var withCredentials = Object.keys(apiKeysObj).length <= 0;
            this.setWithCredentials(withCredentials);
            angular.extend(this.config.apiKeys, apiKeysObj);
        };
        SlashDBServiceProvider.prototype.setupAPIKeysFromLocalStorage = function () {
            var apiKeys = localStorage.getItem('apiKeys');
            if (apiKeys != null) {
                apiKeys = JSON.parse(apiKeys);
                if (angular.equals(apiKeys, this.config.apiKeys)) {
                    angular.extend(this.config.httpRequestConfig.params, apiKeys);
                    this.setWithCredentials(false);
                }
            }
        };
        SlashDBServiceProvider.prototype.$get = function ($http, $q, $cookies, $rootScope) {
            this.setupAPIKeysFromLocalStorage();
            return new SlashDBService($http, $q, $cookies, $rootScope, this.config);
        };
        return SlashDBServiceProvider;
    }());
    angular.module('angularSlashDB', ['ngCookies'])
        .provider('slashDB', new SlashDBServiceProvider());
})();
