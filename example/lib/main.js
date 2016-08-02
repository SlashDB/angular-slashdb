(function () {
    // inject angularSlashDB into the angular app
    var exampleApp = angular.module('exampleApp', ['angularSlashDB'])

        // configure slashDB using the slashDBProvider
        .config(['$httpProvider', 'slashDBProvider', function ($httpProvider, slashDBProvider) {
            // set endpoint to your slashDB instance or leave it pointing to the beta site
            slashDBProvider.setEndpoint('https://beta.slashdb.com');
            // caching is ON by default, in this example we'll turn it OFF
            slashDBProvider.setCacheData(false);
            // api key(s) will  on your SlashDB instance
            slashDBProvider.setAPIKeys({ 'apikey': 'angular-slashdb-example-key' });  // comment this line out if you want to use cookie based authentication
        }])

        // simple service to store user credentials and some helper functions
        .service('credentials', ['slashDB', function (slashDB) {
            var service = {
                user: {
                    name: '',
                    passwd: ''
                },
                loginErrorVisible: false,
                isAuthenticated: function () {
                    return slashDB.isAuthenticated();
                },
                login: function () {
                    if (service.user.name != '' && service.user.passwd != '') {
                        slashDB.login(service.user.name, service.user.passwd).catch(function () {
                            service.loginErrorVisible = true;
                        });
                    } else {
                        service.loginErrorVisible = true;
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
                    <div class="form-group"> \
                        <input type="text" class="form-control" placeholder="Username" ng-model="$ctrl.credentials.user.name"> \
                    </div> \
                    <div class="form-group"> \
                        <input type="password" class="form-control" placeholder="Password" ng-model="$ctrl.credentials.user.passwd"> \
                    </div> \
                    <button type="submit" class="btn btn-primary"><span class="glyphicon glyphicon-log-in" aria-hidden="true"></span> Login</button> \
                </form> \
                <div ng-cloak ng-show="$ctrl.credentials.isAuthenticated()"> \
                    <form class="navbar-form navbar-right"> \
                        <button type="button" class="btn btn-primary navbar-right" ng-click="$ctrl.credentials.logout()"><span class="glyphicon glyphicon-log-out" aria-hidden="true"></span>  Logout</button> \
                    </form> \
                    <p class="navbar-text navbar-right">Signed in as <strong>{{ $ctrl.credentials.user.name }} <span class="glyphicon glyphicon-user" aria-hidden="true"></span></strong></p> \
                </div> \
                <div ng-show="$ctrl.credentials.loginErrorVisible" class="alert alert-danger" role="alert" style="position:fixed;z-index:9999;top:60px;left:40%;width:250px;"> \
                    <button type="button" class="close" aria-label="login error" ng-click="$ctrl.credentials.loginErrorVisible = false"> \
                        <span aria-hidden="true">&times;</span> \
                    </button> \
                    Incorrect login or password. \
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
                filterBy: '',
                clearData: function () {
                    if (service.data.length) {
                        service.data.splice(0, service.data.length);
                    }
                },
                getData: function (config) {
                    var dataUrl = config.baseUrl + '.json';

                    var setData = function () {
                        // through config.requestConfig the developer can set additional, ad-hoc, request attributes
                        slashDB.get(dataUrl, config.requestConfig).then(function (response) {
                            service.data = response.data;
                        }, function () {
                            service.clearData();
                        });
                    };

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
                baseUrl: '/db/SQLiteChinook/Artist',
                requestConfig: {
                    params: angular.copy(defaultParams)
                },
                getRequestParamValue: function (k) {
                    return service.requestConfig.params[k];
                },
                getDefaultRequestParamValue: function (k) {
                    return defaultParams[k];
                },
                setRequestParam: function (k, v) {
                    v = (v != null && v != '') ? v : defaultParams[k];
                    service.requestConfig.params[k] = v;
                    return v;
                },
                setLimitTo: function (v) {
                    return service.setRequestParam('limit', v);
                },
                setSortBy: function (v) {
                    if (service.getRequestParamValue('sort') != v) {
                        v = service.setRequestParam('sort', v);
                        tableData.getData(service);
                    }
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
            <div class="panel panel-default"> \
                <div class="panel-heading">Simple filters</div> \
                <div class="panel-body"> \
                    <form ng-submit="$ctrl.applyFilters()"> \
                        <div class="form-group"> \
                            <label for="filterBy">Filter visible by</label> \
                            <div class="input-group input-group-sm"> \
                                <input type="text" min="0" class="form-control" id="filterBy" placeholder="filter by" ng-model="$ctrl.tableData.filterBy"> \
                                <span class="input-group-btn"> \
                                    <button class="btn btn-default" type="button" ng-click="$ctrl.tableData.filterBy = \'\'"><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span></button> \
                                </span> \
                            </div> \
                        </div> \
                        <div class="form-group"> \
                            <label for="Limit">Limit to</label> \
                            <div class="input-group input-group-sm"> \
                                <input type="number" min="0" class="form-control" id="Limit" placeholder="limit response to" ng-model="$ctrl.model.limit"> \
                                <span class="input-group-btn"> \
                                    <button class="btn btn-default" type="button" ng-click="$ctrl.resetLimit()"><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span></button> \
                                </span> \
                            </div> \
                        </div> \
                        <div class="form-group"> \
                            <label for="Offset">Offset by</label> \
                            <div class="input-group input-group-sm"> \
                                <input type="number" min="0" class="form-control" id="Offset" placeholder="offset response data by" ng-model="$ctrl.model.offset"> \
                                <span class="input-group-btn"> \
                                    <button class="btn btn-default" type="button" ng-click="$ctrl.resetOffset()"><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span></button> \
                                </span> \
                            </div> \
                        </div> \
                        <button type="submit" class="btn btn-primary btn-sm pull-right"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Apply</button> \
                    </form> \
                </div> \
            </div> \
            ',
            controller: function (tableData, artistDataConfig) {
                var ctrl = this;
                ctrl.tableData = tableData;

                ctrl.model = {
                    limit: artistDataConfig.setLimitTo(),
                    offset: artistDataConfig.setOffset()
                };

                ctrl.resetLimit = function () {
                    if (ctrl.model.limit != artistDataConfig.getDefaultRequestParamValue('limit')) {
                        ctrl.model.limit = artistDataConfig.setLimitTo();
                        tableData.getData(artistDataConfig);
                    }
                };

                ctrl.resetOffset = function () {
                    if (ctrl.model.offset != artistDataConfig.getDefaultRequestParamValue('offset')) {
                        ctrl.model.offset = artistDataConfig.setOffset();
                        tableData.getData(artistDataConfig);
                    }
                };

                ctrl.applyFilters = function () {
                    if (ctrl.model.limit != artistDataConfig.getRequestParamValue('limit') || ctrl.model.offset != artistDataConfig.getRequestParamValue('offset')) {
                        artistDataConfig.setLimitTo(ctrl.model.limit);
                        artistDataConfig.setOffset(ctrl.model.offset);
                        tableData.getData(artistDataConfig);
                    }
                };
            }
        })

        // artist panel component
        .component('artistPanel', {
            template: ' \
            <p ng-cloak ng-show="!$ctrl.credentials.isAuthenticated()"> \
                Try and login with <strong>username</strong>: <em>angular</em> and <strong>password</strong>: <em>angular</em>. \
            </p> \
            <div ng-cloak ng-show="$ctrl.credentials.isAuthenticated()"> \
                <p>Try changing some of the request params or adding a new Artist :)</p> \
                <div class="row"> \
                    <div class="col-md-5"> \
                        <filter-bar></filter-bar> \
                    </div> \
                    <div class="col-md-3"> \
                        <artist-form></artist-form> \
                    </div> \
                </div> \
                <table class="table table-striped table-bordered table-hover"> \
                    <thead> \
                        <th ng-click="$ctrl.dataConfig.setSortBy(\'ArtistId\')" class="hand-cursor" ng-class="{\'text-primary\': $ctrl.dataConfig.isSelected(\'ArtistId\')}"><u>Artist Id</u></th> \
                        <th ng-click="$ctrl.dataConfig.setSortBy(\'Name\')" class="hand-cursor" ng-class="{\'text-primary\': $ctrl.dataConfig.isSelected(\'Name\')}"><u>Name</u></th> \
                    </thead> \
                    <tbody> \
                        <tr ng-repeat="artist in $ctrl.tableData.data | filter:$ctrl.tableData.filterBy track by $index"> \
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
                ctrl.dataConfig = artistDataConfig;

                // wait for login event, then set the data
                slashDB.subscribeLogin($scope, function () {
                    tableData.getData(artistDataConfig);
                });

                // clear out data on logout event
                slashDB.subscribeLogout($scope, function () {
                    tableData.clearData();
                });

                // get the artists data and display it
                tableData.getData(artistDataConfig);
            }
        })

        //
        .component('artistForm', {
            template: ' \
            <div class="panel panel-default"> \
                <div class="panel-heading">Add new artist here</div> \
                <div class="panel-body"> \
                    <form ng-submit="$ctrl.addArtist()"> \
                        <div class="form-group"> \
                            <label for="Name">Artists name</label> \
                            <input type="test" class="form-control input-sm" id="Name" placeholder="input artists name" ng-model="$ctrl.artist.Name"> \
                        </div> \
                        <button type="submit" class="btn btn-success btn-sm pull-right"><span class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span> Add new Artist</button> \
                    </form> \
                </div> \
            </div> \
            ',
            controller: function (tableData, artistDataConfig, slashDB) {
                var ctrl = this;
                ctrl.artist = { Name: '' };

                ctrl.addArtist = function () {
                    if (ctrl.artist.Name != null && ctrl.artist.Name != '') {
                        slashDB.post(artistDataConfig.baseUrl, ctrl.artist).then(function (response) {
                            ctrl.artist = '';
                            tableData.getData(artistDataConfig);
                        }, function (response) {
                            console.log('An error has occurred:', response.statusText);
                        });
                    }
                };
            }
        });
})();
