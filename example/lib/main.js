(function () {
    // inject angularSlashDB into the angular app
    var exampleApp = angular.module('exampleApp', ['angularSlashDB'])

        // configure slashDB using the slashDBProvider
        .config(['$httpProvider', 'slashDBProvider', function ($httpProvider, slashDBProvider) {
            // set endpoint to your slashDB instance or leave it pointing to the beta site
            slashDBProvider.setEndpoint('https://beta.slashdb.com');
            // caching is ON by default, in this example we'll turn it OFF
            slashDBProvider.setCacheData(false);
        }])

        // simple service to store user credentials and some helper functions
        .service('credentials', ['slashDB', function (slashDB) {
            var service = {
                user: {
                    name: '',
                    passwd: ''
                },
                isAuthenticated: function () {
                    return slashDB.isAuthenticated();
                },
                login: function () {
                    if (service.user.name != '' && service.user.passwd != '') {
                        slashDB.login(service.user.name, service.user.passwd);
                    }
                },
                logout: function () {
                    slashDB.logout();
                }
            };

            return service;
        }])

        // login component
        .component('loginForm', {
            template: ' \
                <form ng-cloak ng-show="!$ctrl.credentials.isAuthenticated()" class="navbar-form navbar-right" ng-submit="$ctrl.credentials.login()"> \
                    <div class="form-group">\
                        <input type="text" class="form-control" placeholder="Username" ng-model="$ctrl.credentials.user.name"> \
                    </div> \
                    <div class="form-group"> \
                        <input type="password" class="form-control" placeholder="Password" ng-model="$ctrl.credentials.user.passwd"> \
                    </div> \
                    <button type="submit" class="btn btn-primary">Login</button> \
                </form> \
                <div ng-cloak ng-show="$ctrl.credentials.isAuthenticated()"> \
                    <form class="navbar-form navbar-right"> \
                        <button type="button" class="btn btn-primary navbar-right" ng-click="$ctrl.credentials.logout()">Logout</button> \
                    </form> \
                    <p class="navbar-text navbar-right">Signed in as <strong>{{ $ctrl.credentials.user.name }}</strong></p> \
                </div> \
                ',
            controller: function ($scope, credentials, slashDB) {
                var ctrl = this;
                ctrl.credentials = credentials;

                // set user.name only when slashDB.settings are populated
                slashDB.subscribeSettingsChange($scope, function () {
                    credentials.user.name = slashDB.settings.user;
                });

                // clear user credentials on logout
                slashDB.subscribeLogout($scope, function () {
                    credentials.user = credentials.passwd = '';
                });
            }
        })

        .service('tableData', ['slashDB', function (slashDB) {
            var service = {
                data: [],
                clearData: function () {
                    if (service.data.length) {
                        service.data.splice(0, service.data.length);
                    }
                },
                getData: function (config) {
                    var setData = function () {
                        // through config.requestConfig the developer can set additional, ad-hoc, request attributes
                        service.clearData();
                        slashDB.get(config.url, config.requestConfig).then(function (response) {
                            [].push.apply(service.data, response.data);
                        });
                    };

                    // wait for login event, then set the data
                    slashDB.subscribeLogin(config.scope, function () {
                        setData();
                    });

                    // if authenticated just set the data
                    if (slashDB.isAuthenticated()) {
                        setData();
                    }

                    return service.data;
                }
            };

            return service;
        }])

        .service('artistDataConfig', ['tableData', function (tableData) {
            var defaultParams = {
                limit: 25,
                sort: 'ArtistId',
                offset: 0
            };

            var service = {
                url: '/db/Chinook/Artist.json',
                requestConfig: {
                    params: angular.copy(defaultParams)
                },
                scope: null,
                setRequestParam: function (k, v) {
                    v = (v != null && v != '') ? v : defaultParams[k];
                    service.requestConfig.params[k] = v;
                    return v;
                },
                setLimitTo: function (v) {
                    return service.setRequestParam('limit', v);
                },
                setSortBy: function (v) {
                    v = service.setRequestParam('sort', v);
                    tableData.getData(service);
                    return v;
                },
                setOffset: function (v) {
                    return service.setRequestParam('offset', v);
                },
                isSelected: function (v) {
                    return service.requestConfig.params.sort == v;
                }
            };

            return service;
        }])

        // artist table filter bar
        .component('filterBar', {
            template: '\
            <form class="form-inline" ng-submit="$ctrl.applyFilters()"> \
                <div class="form-group"> \
                    <label for="Limit">Limit to</label> \
                    <input type="number" min="0" class="form-control" id="Limit" placeholder="limit response to" ng-model="$ctrl.model.limit"> \
                </div> \
                <div class="form-group"> \
                    <label for="Offset">Offset by</label> \
                    <input type="number" min="0" class="form-control" id="Offset" placeholder="offset response data by" ng-model="$ctrl.model.offset"> \
                </div> \
                <button type="submit" class="btn btn-primary">Apply</button> \
            </form> \
            <br/> \
            ',
            controller: function (tableData, artistDataConfig) {
                var ctrl = this;
                ctrl.model = {
                    limit: artistDataConfig.setLimitTo(),
                    offset: artistDataConfig.setOffset()
                };

                ctrl.applyFilters = function () {
                    artistDataConfig.setLimitTo(ctrl.model.limit);
                    artistDataConfig.setOffset(ctrl.model.offset);
                    tableData.getData(artistDataConfig);
                };
            }
        })

        // artist table component
        .component('artistTable', {
            template: ' \
            <p>This is a simple example app powered by <a href="https://angularjs.org/" target="_blank">AngularJS</a> and <a href="https://github.com/SlashDB/angular-slashdb" target="_blank">angular-slashdb</a>. \
            <p ng-cloak ng-show="!$ctrl.credentials.isAuthenticated()"> \
                Try and login with <strong>username</strong>: <em>angular</em> and <strong>password</strong>: <em>angular</em>. \
            </p> \
            <div ng-cloak ng-show="$ctrl.credentials.isAuthenticated()"> \
                <p>Try changing some of the request params :)</p> \
                <filter-bar></filter-bar> \
                <table class="table table-striped table-bordered table-hover"> \
                    <thead> \
                        <th ng-click="$ctrl.dataConfig.setSortBy(\'ArtistId\')" class="hand-cursor" ng-class="{\'text-primary\': $ctrl.dataConfig.isSelected(\'ArtistId\')}"><u>Artist Id</u></th> \
                        <th ng-click="$ctrl.dataConfig.setSortBy(\'Name\')" class="hand-cursor" ng-class="{\'text-primary\': $ctrl.dataConfig.isSelected(\'Name\')}"><u>Name</u></th> \
                    </thead> \
                    <tbody> \
                        <tr ng-repeat="artist in $ctrl.tableData.data track by $index"> \
                            <th>{{ artist.ArtistId }}</th> \
                            <td>{{ artist.Name }}</td> \
                        </tr> \
                    </tbody> \
                </table> \
            </div> \
            ',
            controller: function ($scope, tableData, artistDataConfig, credentials, slashDB) {
                var ctrl = this;
                ctrl.tableData = tableData;
                ctrl.credentials = credentials;

                // clear out data on logout event
                slashDB.subscribeLogout($scope, function () {
                    tableData.clearData();
                });

                // set data config
                artistDataConfig.scope = $scope;
                ctrl.dataConfig = artistDataConfig;

                // change the 'example' to your preferred database name
                tableData.getData(ctrl.dataConfig);
            }
        });
})();
