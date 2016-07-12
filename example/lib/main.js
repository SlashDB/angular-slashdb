(function () {
    angular.module('exampleApp', ['angularSlashDB'])
        .config(['slashDBProvider', function (slashDB) {
            slashDB.setEndpoint('http://localhost:6543');
            slashDB.setCacheData(false);
        }]);
})();
