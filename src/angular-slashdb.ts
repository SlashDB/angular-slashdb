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
        loggedInUser: string
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
            this.settings = { loggedInUser: '' };

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

        notifySettingsChange(): angular.IAngularEvent {
            return this.$rootScope.$emit('slashdb-service-settings-update-event');
        }

        getSettings(): angular.IPromise<any> {
            let requetUrl: string = this.getUrl('/settings.json');
            return this.$http.get(requetUrl)
                .then((response): ISlashDBSettings => {
                    this.settings = angular.copy(response.data as ISlashDBSettings);
                    this.notifySettingsChange();
                    return this.settings
                })
        }

        login(user: string, password: string): angular.IPromise<any> {
            let requetUrl: string = this.getUrl('/login');
            return this.$http.post(requetUrl, { login: user, password: password })
                .then((response): angular.IPromise<any> => {
                    this.$cookies.put('auth_tkt_user', user);
                    return this.getSettings();
                });
        }

        logout(): angular.IPromise<any> {
            let requetUrl: string = this.getUrl('/logout');
            return this.$http.get(requetUrl)
                .finally((): angular.IPromise<any> => {
                    this.$cookies.remove('auth_tkt');
                    return this.getSettings();
                });
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

        subscribe(scope: angular.IScope, callback: AngularEventHandler) {
            let handler = this.$rootScope.$on('slashdb-service-settings-update-event', callback);
            scope.$on('$destroy', handler as AngularEventHandler);
        }

        get(url: string, asArray: boolean = true): angular.IPromise<any> | angular.IHttpPromise<any> {
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
        $get: any[];

        constructor() {
            this.config = {
                endpoint: 'http://localhost',
                cacheData: false,
                httpRequestConfig: {
                    headers: {}
                }
            };
        }

        setEndpoint(endpoint: string) {
            this.config.endpoint = endpoint;
        }

        setCacheData(cacheData: boolean) {
            this.config.cacheData = cacheData;
        }

        setHeaders(headers: angular.IHttpRequestConfigHeaders) {
            this.config.httpRequestConfig.headers = headers;
        }
    }


    angular.module('angularSlashDB', ['ngCookies'])
        .provider('slashDBProvider', new SlashDBServiceProvider());

})();
