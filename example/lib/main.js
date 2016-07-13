(function () {
    // inject angularSlashDB into the angular app
    var exampleApp = angular.module('exampleApp', ['angularSlashDB'])

        // configure slashDB using the slashDBProvider
        .config(['$httpProvider', 'slashDBProvider', function ($httpProvider, slashDBProvider) {
            $httpProvider.defaults.withCredentials = true;

            slashDBProvider.setEndpoint('http://localhost:6543');
            // cacheing is ON by default, in this example we'll turn it OFF
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
                        <button ng-show="$ctrl.credentials.isAuthenticated()" type="button" class="btn btn-primary navbar-right" ng-click="$ctrl.credentials.logout()">Logout</button> \
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
            },
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
                        slashDB.get(config.url, config.requestConfig).then(function (data) {
                            service.clearData();
                            [].push.apply(service.data, data);
                        });
                    }

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

        // artist table component
        .component('artistTable', {
            template: ' \
            <h3 ng-cloak ng-show="!$ctrl.credentials.isAuthenticated()"> \
                Try and login with <strong>username</strong>: <em>admin</em> and <strong>password</strong>: <em>admin</em>. \
            </h3> \
            <table ng-cloak ng-show="$ctrl.credentials.isAuthenticated()" class="table table-striped table-bordered table-hover"> \
                <thead> \
                    <th>Artist Id</th> \
                    <th>Name</th> \
                </thead> \
                <tbody> \
                    <tr ng-repeat="artist in $ctrl.tableData.data track by $index"> \
                        <th>{{ artist.ArtistId }}</th> \
                        <td>{{ artist.Name }}</td> \
                    </tr> \
                </tbody> \
            </table> \
            ',
            controller: function ($scope, tableData, credentials, slashDB) {
                var ctrl = this;
                ctrl.tableData = tableData;
                ctrl.credentials = credentials;

                slashDB.subscribeLogout($scope, function () {
                    tableData.clearData();
                });

                var requestConfig = {
                    params: {
                        limit: 50,
                        sort: 'Name',
                        offset: 3
                    }
                };
                // change the 'examle' to your prefered database name
                tableData.getData({ url: '/db/example/Artist.json', requestConfig: requestConfig, scope: $scope });
            }
        });
})();
