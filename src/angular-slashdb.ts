(function () {
    'use strict';

    /**
     * Interface representing the shape of a SlashDB config object.
     */
    interface ISlashDBConfig {
        endpoint: string;
        cacheData: boolean;
        apiKeys: { [key: string]: string };
        httpRequestConfig: angular.IRequestShortcutConfig;
    }


    /**
     * Interface representing the shape of a SlashDB settings object.
     */
    interface ISlashDBSettings {
        user: string;
        reversed_url_substitution: any;
        default_limit: number;
        refid_prefix: string;
    }


    /**
     * Interface representing the shape of a SlashDB dummy sessionStorage object.
     */
    interface ISlashDBStorage {
        data: {};
        getItem(key: string): any;
        setItem(key: string, value: any): void;
    }


    /**
     * Interface representing the shape of a SlashDB DBUserCredentials object.
     */
    interface ISlashDBUserCredentials {
        dbuser: string;
        dbpass: string;
        [key: string]: string;
    }


    /**
     * Interface representing the shape of a SlashDB DBDef object.
     */
    interface ISlashDBDef {
        'db_encoding': string;
        'owners': string[];
        'execute': string[];
        'creator': string;
        'read': string[];
        'db_type': string;
        'autoload': boolean;
        'write': string[];
        'connect_status': string;
        'connection': string;
        'foreign_keys': {};
        'sysuser': ISlashDBUserCredentials;
        'db_schema': any;
        'offline': boolean;
        'alternate_key': {};
        'excluded_columns': {};
        'desc': string;
        [key: string]: any;
    }


    /**
     * Interface representing the shape of a SlashDB UserDef object.
     */
    interface ISlashDBUserDef {
        'userdef': string[],
        'api_key': string,
        'name': string,
        'creator': string,
        'edit': string[];
        'dbdef': string[];
        'querydef': string[];
        'databases': { [key: string]: ISlashDBUserCredentials };
        'password': string;
        'email': string;
        'view': string;
        [key: string]: any;
    }


    /**
     * Interface representing the shape of a SlashDB QueryDef object.
     */
    interface ISlashDBQueryDef {
        'owners': string[];
        'viewable': boolean;
        'creator': string;
        'read': string[];
        'database': string;
        'execute': string[];
        'write': string[];
        'sqlstr': string;
        'executable': boolean;
        'columns': string;
        [key: string]: any;
    }


    /**
     * Interface representing the shape of a SlashDB SQL Pass-thru Query object.
     */
    interface ISlashDBQuery {
        'desc': string;
        'parameters': string[];
        'database': string;
        [key: string]: any;
    }


    // Angular Event type alias - for ease of use.
    type AngularEventHandler = (event: angular.IAngularEvent, ...args: any[]) => any;

    /**
     * Main SlashDB service class.
     */
    class SlashDBService {
        $http: angular.IHttpService;
        $q: angular.IQService;
        $cookies: angular.cookies.ICookiesService;
        $rootScope: angular.IRootScopeService;

        config: ISlashDBConfig;
        settings: ISlashDBSettings;
        dbDefs: { [dbName: string]: ISlashDBDef };
        userDefs: { [userName: string]: ISlashDBUserDef };
        queryDefs: { [queryName: string]: ISlashDBQueryDef };
        passThruQueries: { [passThruQueryName: string]: ISlashDBQuery };
        storage: Storage | ISlashDBStorage;

        static $inject = ['$http', '$q', '$cookies', '$rootScope'];
        constructor($http: angular.IHttpService, $q: angular.IQService, $cookies: angular.cookies.ICookiesService, $rootScope: angular.IRootScopeService, config: ISlashDBConfig) {
            this.$http = $http;
            this.$q = $q;
            this.$cookies = $cookies;
            this.$rootScope = $rootScope;

            this.config = config;
            this.settings = {} as ISlashDBSettings;  // local cache for settings provided by the slashDB instance
            this.dbDefs = {};                        // local cache for slashDB database definitions
            this.userDefs = {};                      // local cache for slashDB user definitions
            this.queryDefs = {};                     // local cache for slashDB SQL Pass-thru query definitions

            // init this.settings
            this.getSettings();

            // use window.sessionStorage if available else use a simple dummy sessionStorage object
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
                };
                this.storage = storage;
            }
        }

        private getUrl(url: string): string {
            // concatenates the base endpoint and a given path to a complete url
            return `${this.config.endpoint}${url}`;
        }

        private subscribe(scope: angular.IScope, eventName: string, callback: AngularEventHandler): void {
            // a helper factory method
            let handler = this.$rootScope.$on(eventName, callback);
            scope.$on('$destroy', handler as AngularEventHandler);
        }

        escapeValue(value: string): string {
            // replaces characters using mapping defined in SlashDB settings
            for (let key in this.settings.reversed_url_substitution) {
                if (this.settings.reversed_url_substitution.hasOwnProperty(key)) {
                    let substitution = this.settings.reversed_url_substitution[key];
                    value = value.split(key).join(substitution);
                }
            }
            return value;
        }

        subscribeLogin(scope: angular.IScope, callback: AngularEventHandler): void {
            // subscribe to a login event
            this.subscribe(scope, 'slashdb-service-login-event', callback);
        }

        notifyLogin() {
            // emmit a login event
            return this.$rootScope.$emit('slashdb-service-login-event');
        }

        subscribeLogout(scope: angular.IScope, callback: AngularEventHandler): void {
            // subscribe to a logout event
            this.subscribe(scope, 'slashdb-service-logout-event', callback);
        }

        notifyLogout() {
            // emmit a logout event
            return this.$rootScope.$emit('slashdb-service-logout-event');
        }

        subscribeSettingsChange(scope: angular.IScope, callback: AngularEventHandler): void {
            // subscribe to a settings change event
            this.subscribe(scope, 'slashdb-service-settings-update-event', callback);
        }

        notifySettingsChange() {
            // emmit a settings change event
            return this.$rootScope.$emit('slashdb-service-settings-update-event');
        }

        getSettings() {
            // fetches settings object from slashDB instance
            return this.get('/settings.json').then((response): {} => {
                if (response.status == 200) {
                    angular.extend(this.settings, response.data[0]);
                    this.notifySettingsChange();
                }
                return response;
            });
        }

        login(user: string, password: string) {
            // perform a login request
            let data: {} = { login: user, password: password };
            return this.post('/login', data).then((response): {} => {
                if (!this.config.httpRequestConfig.withCredentials) {
                    // extend request params with apiKeys
                    angular.extend(this.config.httpRequestConfig.params, this.config.apiKeys);
                    // store apiKeys in localStorage
                    localStorage.setItem('apiKeys', JSON.stringify(this.config.apiKeys));
                }
                this.notifyLogin();
                this.getSettings();
                return response;
            });
        }

        logout() {
            // perform a logout request
            let handler = (response) => {
                if (this.config.httpRequestConfig.withCredentials) {
                    // remove auth_tkt from cookies
                    this.$cookies.remove('auth_tkt');
                } else {
                    // remove apiKeys from request params
                    let tmp = Object.keys(this.config.apiKeys);
                    for (let i = 0, tmpl = tmp.length; i < tmpl; i++) {
                        delete this.config.httpRequestConfig.params[tmp[i]];
                    }
                    // remove apiKeys form localStorage
                    localStorage.removeItem('apiKeys');
                }
                this.notifyLogout();
                this.getSettings();
            };

            return this.get('/logout', {}, true).then(handler, handler);
        }

        isAuthenticated(): boolean {
            // checks if the user is authenticated
            if (this.config.httpRequestConfig.withCredentials) {
                // for withCredentials==true check if a auth_tkt cookie is present
                return this.$cookies.get('auth_tkt') != null || (this.settings.user != null && this.settings.user != '');
            }
            // else check if any config.apiKeys ar set
            let tmp = Object.keys(this.config.apiKeys), tmpl = tmp.length, k, v;
            if (tmpl > 0) {
                for (let i = 0; i < tmpl; i++) {
                    k = tmp[i];
                    v = this.config.httpRequestConfig.params[k];
                    if (v == null && v != this.config.apiKeys[k]) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }

        uploadLicense(licFile: File) {
            // uploads licence file data to slashDB instance
            let fd = new FormData();
            let userRequestConfig = { transformRequest: angular.identity, headers: { 'Content-Type': undefined } };
            fd.append('license', licFile);
            return this.post('/license', fd, userRequestConfig);
        }

        loadModel(dbName: string) {
            // connects a given database on the backend
            return this.get(`/load-model/${dbName}.json`);
        }

        unloadModel(dbName: string) {
            // disconnects a given database on the backend
            return this.get(`/unload-model/${dbName}.json`);
        }

        getDBDefs(force: boolean = false): angular.IPromise<any> | angular.IHttpPromise<{}> {
            // perform a request for definitions for all databases
            let promise: angular.IPromise<any> | angular.IHttpPromise<{}>;
            let response: any;

            if (this.config.cacheData && !force && Object.keys(this.dbDefs).length > 0) {
                promise = this.$q((resolve, reject): void => {
                    response = { data: this.dbDefs };
                    resolve(response);
                })
            } else {
                promise = this.get('/dbdef.json').then(
                    function (response) {
                        if (response.status == 200) {
                            this.dbDefs = response.data;
                        }
                        return response;
                    });
            }
            return promise;
        }

        getDBDef(dbName: string, force: boolean = false): angular.IPromise<any> | angular.IHttpPromise<{}> {
            // perform a request for definition for a given database
            let promise: angular.IPromise<any> | angular.IHttpPromise<{}>;
            let response: any;

            if (this.config.cacheData && !force && this.dbDefs[dbName] != null) {
                promise = this.$q((resolve, reject): void => {
                    response = { data: this.dbDefs[dbName] };
                    resolve(response);
                })
            } else {
                promise = this.get(`/dbdef/${dbName}.json`);
            }
            return promise;
        }

        createDBDef(dbName: string, data: ISlashDBDef) {
            // create a new database definition
            let sdbUrl: string = `/dbdef/${dbName}.json`;
            return this.post(sdbUrl, data);
        }

        updateDBDef(dbName: string, data: ISlashDBDef) {
            // update a database definition
            let sdbUrl: string = `/dbdef/${dbName}.json`;
            return this.put(sdbUrl, data);
        }

        deleteDBDef(dbName: string) {
            // delete a database definition
            let sdbUrl: string = `/dbdef/${dbName}.json`;
            return this.delete(sdbUrl);
        }

        getUserDefs(force: boolean = false): angular.IPromise<any> | angular.IHttpPromise<{}> {
            // perform a request for definitions for all users
            let promise: angular.IPromise<any> | angular.IHttpPromise<{}>;
            let response: any;

            if (this.config.cacheData && !force && Object.keys(this.userDefs).length > 0) {
                promise = this.$q((resolve, reject): void => {
                    response = { data: this.userDefs };
                    resolve(response);
                })
            } else {
                promise = this.get('/userdef.json').then(
                    function (response) {
                        if (response.status == 200) {
                            this.userDefs = response.data;
                        }
                        return response;
                    });
            }
            return promise;
        }

        getUserDef(userName: string, force: boolean = false): angular.IPromise<any> | angular.IHttpPromise<{}> {
            // perform a request for definition for a given user
            let promise: angular.IPromise<any> | angular.IHttpPromise<{}>;
            let response: any;

            if (this.config.cacheData && !force && this.userDefs[userName] != null) {
                promise = this.$q((resolve, reject): void => {
                    response = { data: this.userDefs[userName] };
                    resolve(response);
                })
            } else {
                promise = this.get(`/userdef/${userName}.json`);
            }
            return promise;
        }

        createUserDef(userName: string, data: ISlashDBUserDef) {
            // create a new user definition
            let sdbUrl: string = `/userdef/${userName}.json`;
            return this.post(sdbUrl, data);
        }

        updateUserDef(userName: string, data: ISlashDBUserDef) {
            // update a user definition
            let sdbUrl: string = `/userdef/${userName}.json`;
            return this.put(sdbUrl, data);
        }

        deleteUserDef(userName: string) {
            // delete a user definition
            let sdbUrl: string = `/userdef/${userName}.json`;
            return this.delete(sdbUrl);
        }

        getQueryDefs(force: boolean = false): angular.IPromise<any> | angular.IHttpPromise<{}> {
            // perform a request for definitions for all queries
            let promise: angular.IPromise<any> | angular.IHttpPromise<{}>;
            let response: any;

            if (this.config.cacheData && !force && Object.keys(this.queryDefs).length > 0) {
                promise = this.$q((resolve, reject): void => {
                    response = { data: this.queryDefs };
                    resolve(response);
                })
            } else {
                promise = this.get('/querydef.json').then(
                    function (response) {
                        if (response.status == 200) {
                            this.queryDefs = response.data;
                        }
                        return response;
                    });
            }
            return promise;
        }

        getQueryDef(queryName: string, force: boolean = false): angular.IPromise<any> | angular.IHttpPromise<{}> {
            // perform a request for definition for a given query
            let promise: angular.IPromise<any> | angular.IHttpPromise<{}>;
            let response: any;

            if (this.config.cacheData && !force && this.queryDefs[queryName] != null) {
                promise = this.$q((resolve, reject): void => {
                    response = { data: this.queryDefs[queryName] };
                    resolve(response);
                })
            } else {
                promise = this.get(`/querydef/${queryName}.json`);
            }
            return promise;
        }

        createQueryDef(queryName: string, data: ISlashDBUserDef) {
            // create a new query definition
            let sdbUrl: string = `/querydef/${queryName}.json`;
            return this.post(sdbUrl, data);
        }

        updateQueryDef(queryName: string, data: ISlashDBUserDef) {
            // update a query definition
            let sdbUrl: string = `/querydef/${queryName}.json`;
            return this.put(sdbUrl, data);
        }

        deleteQueryDef(queryName: string) {
            // delete a query definition
            let sdbUrl: string = `/querydef/${queryName}.json`;
            return this.delete(sdbUrl);
        }

        private updateRequestConfig(userRequestConfig: {}): angular.IRequestShortcutConfig {
            // this method allows the user to ad-hoc update request attributes i.e. headers, query params etc.
            // for more see https://code.angularjs.org/1.5.7/docs/api/ng/service/$http#usage
            return angular.merge({}, this.config.httpRequestConfig, userRequestConfig);
        }

        getQueries(force: boolean = false): angular.IPromise<any> | angular.IHttpPromise<{}> {
            // perform a request for a list available SQL Pass-thru queries
            let promise: angular.IPromise<any> | angular.IHttpPromise<{}>;
            let response: any;

            if (this.config.cacheData && !force && this.passThruQueries != null) {
                promise = this.$q((resolve, reject): void => {
                    response = { data: this.passThruQueries };
                    resolve(response);
                })
            } else {
                promise = this.get('/query.json').then(
                    function (response) {
                        if (response.status == 200) {
                            this.passThruQueries = response.data;
                        }
                        return response;
                    });
            }
            return promise;
        }

        executeQuery(url: string, userRequestConfig: {} = {}, force: boolean = false, asArray: boolean = true): angular.IPromise<any> | angular.IHttpPromise<{}> {
            // execute SQL Pass-thru query
            let sdbUrl = `${this.config.endpoint}/query${url}`;
            let promise: angular.IPromise<any> | angular.IHttpPromise<{}>;
            let data, response: any;

            if (this.config.cacheData && !force && this.storage.getItem(sdbUrl) != null) {
                promise = this.$q((resolve, reject): void => {
                    response = JSON.parse(this.storage.getItem(sdbUrl));
                    resolve(response);
                })
            } else {
                let requestConfig = this.updateRequestConfig(userRequestConfig);
                promise = this.$http.get(sdbUrl, requestConfig)
                    .then((response): {} => {
                        if (response.status == 200) {
                            data = (!Array.isArray(response.data) && asArray) ? [response.data] : response.data;
                            response.data = data;

                            if (this.config.cacheData) {
                                this.storage.setItem(sdbUrl, JSON.stringify(response));
                            }
                        }
                        return response;
                    });
            }
            return promise
        }

        get(url: string, userRequestConfig: {} = {}, force: boolean = false, asArray: boolean = true): angular.IPromise<any> | angular.IHttpPromise<{}> {
            // gets all your favorite resources, wrapper around angulars $http.get
            let sdbUrl = this.getUrl(url);
            let promise: angular.IPromise<any> | angular.IHttpPromise<{}>;
            let data, response: any;

            if (this.config.cacheData && !force && this.storage.getItem(sdbUrl) != null) {
                promise = this.$q((resolve, reject): void => {
                    response = JSON.parse(this.storage.getItem(sdbUrl));
                    resolve(response);
                })
            } else {
                // If 'asArray' set true this will always return data as an Array. Otherwise it will pick the first element of a given Array.
                let requestConfig = this.updateRequestConfig(userRequestConfig);
                promise = this.$http.get(sdbUrl, requestConfig)
                    .then((response): {} => {
                        if (response.status == 200) {
                            if (Array.isArray(response.data)) {
                                data = asArray ? response.data : response.data[0];
                            } else {
                                data = asArray ? [response.data] : response.data;
                            }
                            response.data = data;

                            if (this.config.cacheData) {
                                this.storage.setItem(sdbUrl, JSON.stringify(response));
                            }
                        }
                        return response;
                    });
            }

            return promise;
        }

        post(url: string, data: any, userRequestConfig: {} = {}) {
            // sends new data to all your favorite resources, wrapper around angulars $http.post
            let sdbUrl: string = this.getUrl(url);
            let requestConfig = this.updateRequestConfig(userRequestConfig);
            return this.$http.post(sdbUrl, data, requestConfig);
        }

        put(url: string, data: any, userRequestConfig: {} = {}) {
            // sends update data to all your favorite resources, wrapper around angulars $http.put
            let sdbUrl: string = this.getUrl(url);
            let requestConfig = this.updateRequestConfig(userRequestConfig);
            return this.$http.put(sdbUrl, data, requestConfig);
        }

        delete(url: string, userRequestConfig: {} = {}) {
            // sends delete request to all your favorite resources, wrapper around angulars $http.delete
            let sdbUrl: string = this.getUrl(url);
            let requestConfig = this.updateRequestConfig(userRequestConfig);
            return this.$http.delete(sdbUrl, requestConfig);
        }
    }


    /**
     * SlashDB service provider class.
     */
    class SlashDBServiceProvider implements angular.IServiceProvider {
        config: ISlashDBConfig;

        constructor() {
            this.config = {
                endpoint: '',              // default slashDB endpoint, it's required to set this to a proper value
                cacheData: false,          // determines if cached data should be used
                apiKeys: {},               // hold optional API keys
                httpRequestConfig: {       // user provided request config
                    headers: {},           // holds user provided request headers
                    params: {},            // holds user provided request params i.e. {depth: 1, sort: LastName}
                    withCredentials: true  // determines if cookie based authentication should be used
                }
            };
        }

        setEndpoint(endpoint: string): void {
            // sets default endpoint
            this.config.endpoint = endpoint;
        }

        setCacheData(cacheData: boolean): void {
            // sets cacheData caching flag
            this.config.cacheData = cacheData;
        }

        setHeaders(headers: angular.IHttpRequestConfigHeaders): void {
            // sets default request headers of your choice
            this.config.httpRequestConfig.headers = headers;
        }

        setWithCredentials(newValue: boolean): void {
            // sets flag determining what method of authentication should be used
            // true - means that angular-shashdb will use cookie based authentication
            // false - means that the user API keys will be used
            this.config.httpRequestConfig.withCredentials = newValue;
        }

        setAPIKeys(apiKeysObj: { [key: string]: string }): void {
            // sets API authentication request keys - provided by your slashDB instance admin
            // important: this will be only used after the (slashDB service) login method has been used
            let withCredentials = Object.keys(apiKeysObj).length <= 0;
            this.setWithCredentials(withCredentials);
            angular.extend(this.config.apiKeys, apiKeysObj);
        }

        private setupAPIKeysFromLocalStorage() {
            // check for api key stored in localStorage and if present, set them as request params
            let apiKeys = localStorage.getItem('apiKeys');
            if (apiKeys != null) {
                apiKeys = JSON.parse(apiKeys);
                if (angular.equals(apiKeys, this.config.apiKeys)) {
                    angular.extend(this.config.httpRequestConfig.params, apiKeys);
                    // make sure that withCredentials is set to false
                    this.setWithCredentials(false);
                }
            }
        }

        $get($http: angular.IHttpService, $q: angular.IQService, $cookies: angular.cookies.ICookiesService, $rootScope: angular.IRootScopeService): SlashDBService {
            // returns a SlashDBService instance
            // get apiKeys form localStorage and use them for authentication
            this.setupAPIKeysFromLocalStorage();
            return new SlashDBService($http, $q, $cookies, $rootScope, this.config);
        }
    }


    angular.module('angularSlashDB', ['ngCookies'])
        .provider('slashDB', new SlashDBServiceProvider());

})();
