(function () {
    angular.module('exampleApp', ['angularSlashDB'])
        .config(['slashDBProvider', function (slashDBProvider) {
            cosole.log('dad')
            slashDBProvider.setEndpoint('http://localhost:6543');
            slashDBProvider.setCacheData(false);
        }]);
})();
