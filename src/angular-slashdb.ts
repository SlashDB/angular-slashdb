(function () {
    'use strict';

    /**
     * Interface representing the shape of a SlashDB config object.
     */
    interface ISlashDBConfig {
        endpoint: string,
        cacheData: boolean,
        httpRequestConfig: angular.IRequestShortcutConfig
    }


    /**
     * Interface representing the shape of a SlashDB settings object.
     */
    interface ISlashDBSettings {
        user: string
    }


    /**
     * Interface representing the shape of a SlashDB storage object.
     */
    interface ISlashDBStorage {
        data: {},
        getItem(key: string): any,
        setItem(key: string, value: any): void
    }

    // Amgular Event type alias - for ease of use.
    type AngularEventHandler = (event: angular.IAngularEvent, ...args: any[]) => any;

    /**
     * Main SlashDB service class.
     */
    class SlashDBService {
        $http: angular.IHttpService;
        $q: angular.IQService;
        $cookies: ng.cookies.ICookieStoreService;
        $rootScope: angular.IRootScopeService;

        config: ISlashDBConfig;
        settings: ISlashDBSettings;
        storage: Storage | ISlashDBStorage

        static $inject = ['$http', '$q', '$cookies', '$rootScope'];
        constructor($http: angular.IHttpService, $q: angular.IQService, $cookies: ng.cookies.ICookieStoreService, $rootScope: angular.IRootScopeService, config: ISlashDBConfig) {
            this.$http = $http;
            this.$q = $q;
            this.$cookies = $cookies;
            this.$rootScope = $rootScope;

            this.config = config;
            this.settings = { user: '' };

            // if authenticated then get init this.settings
            if (this.isAuthenticated() && this.settings.user == '') {
                this.getSettings();
            }

            // use window.sessionStorage if available else use a simple
            if (window.sessionStorage != null) {
                this.storage = window.sessionStorage;
            } else {
                let storage: ISlashDBStorage = {
                    data: {},
                    setItem: (key: string, value: any): void => {
                        storage.data[key] = value;
                    },
                    getItem: (key: string): any => {
                        return storage.data[key];
                    }
                }
                this.storage = storage;
            }
        }

        getUrl(url: string): string {
            return `${this.config.endpoint}${url}`;
        }

        private subscribe(scope: angular.IScope, eventName: string, callback: AngularEventHandler) {
            // a helper factory method
            let handler = this.$rootScope.$on(eventName, callback);
            scope.$on('$destroy', handler as AngularEventHandler);
        }

        subscribeLogin(scope: angular.IScope, callback: AngularEventHandler) {
            // subscrive to a login envent
            this.subscribe(scope, 'slashdb-service-login-event', callback);
        }

        notifyLogin(): angular.IAngularEvent {
            // emmit a login event
            return this.$rootScope.$emit('slashdb-service-login-event');
        }

        subscribeLogout(scope: angular.IScope, callback: AngularEventHandler) {
            // subscrive to a logout envent
            this.subscribe(scope, 'slashdb-service-logout-event', callback);
        }

        notifyLogout(): angular.IAngularEvent {
            // emmit a logout event
            return this.$rootScope.$emit('slashdb-service-logout-event');
        }

        subscribeSettingsChange(scope: angular.IScope, callback: AngularEventHandler) {
            // subscrive to a settings change envent
            this.subscribe(scope, 'slashdb-service-settings-update-event', callback);
        }

        notifySettingsChange(): angular.IAngularEvent {
            // emmit a settings change envent
            return this.$rootScope.$emit('slashdb-service-settings-update-event');
        }

        getSettings(): angular.IPromise<any> {
            let requetUrl: string = this.getUrl('/settings.json');
            return this.$http.get(requetUrl)
                .then((response): ISlashDBSettings => {
                    angular.extend(this.settings, response.data);
                    this.notifySettingsChange();
                    return this.settings
                })
        }

        login(user: string, password: string): angular.IPromise<any> {
            let requetUrl: string = this.getUrl('/login');

            return this.$http.post(requetUrl, { login: user, password: password })
                .then((response): angular.IPromise<any> => {
                    this.$cookies.put('auth_tkt_user', user);
                    this.notifyLogin();
                    return this.getSettings();
                });
        }

        logout(): angular.IPromise<any> {
            let requetUrl: string = this.getUrl('/logout');
            return this.$http.get(requetUrl)
                .finally((): angular.IPromise<any> => {
                    this.$cookies.remove('auth_tkt');
                    this.notifyLogout();
                    return this.getSettings();
                });
        }

        isAuthenticated(): boolean {
            return this.$cookies.get('auth_tkt') != null;
        }

        executeQuery(url: string, asArray: boolean = true): angular.IPromise<any> | angular.IHttpPromise<any> {
            let sdbUrl = `${this.config.endpoint}/query${url}`
            let promise: angular.IPromise<any> | angular.IHttpPromise<any>;
            let data: any;

            if (this.config.cacheData && this.storage.getItem(sdbUrl) != null) {
                promise = this.$q((resolve, reject): void => {
                    data = JSON.parse(this.storage.getItem(sdbUrl));
                    resolve(data);
                })
            } else {
                promise = this.$http.get(sdbUrl, this.config.httpRequestConfig)
                    .then(
                    (response): {} => {
                        data = (!Array.isArray(response.data) && asArray) ? [response.data] : data = response.data;

                        if (this.config.cacheData) {
                            this.storage.setItem(sdbUrl, JSON.stringify(data));
                        }

                        return data;
                    },
                    (response): {} => this.$q.reject(response.data));
            }
            return promise
        }

        get(url: string, asArray: boolean = true): angular.IPromise<any> | angular.IHttpPromise<any> {
            // gets all your favorite resources
            let sdbUrl = this.getUrl(url);
            let promise: angular.IPromise<any> | angular.IHttpPromise<any>;
            let data: any;

            if (this.config.cacheData && this.storage.getItem(sdbUrl) != null) {
                promise = this.$q((resolve, reject): void => {
                    data = JSON.parse(this.storage.getItem(sdbUrl));
                    resolve(data);
                })
            } else {
                // If 'asArray' set true this will always return data as an Array. Otherwise it will pick the first element of a given Array.
                promise = this.$http.get(sdbUrl, this.config.httpRequestConfig)
                    .then(
                    (response): {} => {
                        if (Array.isArray(response.data)) {
                            data = asArray ? response.data : response.data[0];
                        } else {
                            data = asArray ? [response.data] : response.data;
                        }

                        if (this.config.cacheData) {
                            this.storage.setItem(sdbUrl, JSON.stringify(data));
                        }

                        return data;
                    },
                    (response): {} => this.$q.reject(response.data));
            }

            return promise;
        }

        post(url: string, data: any): angular.IHttpPromise<any> {
            let sdbUrl: string = this.getUrl(url);
            return this.$http.post(sdbUrl, data, this.config.httpRequestConfig);
        }
    }


    /**
     * SlashDB service provider class.
     */
    class SlashDBServiceProvider implements angular.IServiceProvider {
        config: ISlashDBConfig;

        constructor() {
            this.config = {
                endpoint: 'http://localhost',
                cacheData: false,
                httpRequestConfig: {
                    headers: {},
                    params: {}
                }
            };
        }

        setEndpoint(endpoint: string) {
            // sets default endpoint
            this.config.endpoint = endpoint;
        }

        setCacheData(cacheData: boolean) {
            // sets cacheData boolean flag
            this.config.cacheData = cacheData;
        }

        setHeaders(headers: angular.IHttpRequestConfigHeaders) {
            // sets headers of your choice
            this.config.httpRequestConfig.headers = headers;
        }

        setParams(params: string | {}) {
            // sets request params of your choice
            this.config.httpRequestConfig.params = params;
        }

        $get($http: angular.IHttpService, $q: angular.IQService, $cookies: ng.cookies.ICookieStoreService, $rootScope: angular.IRootScopeService): SlashDBService {
            // returns a SlashDBService instance
            return new SlashDBService($http, $q, $cookies, $rootScope, this.config);
        }
    }


    angular.module('angularSlashDB', ['ngCookies'])
        .provider('slashDB', new SlashDBServiceProvider());

})();
