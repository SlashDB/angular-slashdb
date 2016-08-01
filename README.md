angular-slashdb - AngularJS bindings to [SlashDB](http://www.slashdb.com/)
=========

[SlashDB](http://www.slashdb.com/) automatically creates REST APIs on top of traditional databases for reading and writing by authorized applications without the need of SQL queries. Angular-slashdb is a small plug-in, allowing you to use SlashDB features more easily in your AngularJS app. Together they allow developers to avoid tedious work and focus on application features that matter.


# Usage example
```javascript
var exampleApp = angular.module('exampleApp', ['angularSlashDB'])
    .config(['slashDBProvider', function (slashDBProvider) {
        // set endpoint to your slashDB instance
        slashDBProvider.setEndpoint('http://localhost:6543');
    }])
    .service('myService', ['slashDB', function (slashDB) {
        var defaultData = [{ 'Name': 'AC/DC' }, { 'Name': 'Buddy Guy' }];
        var model = { data: defaultData };

        // update initial model data
        slashDB.get('/db/Chinook/Artist.json').then(function(response) {
                model.data = response.data;
            });
        });

        return model;
    }]);
```
see [example application](https://slashdb.github.io/angular-slashdb/) folder for more details.


# Table of contents

- [Install angular-slashdb](#install-angular-slashdb)
    - [Dependencies](#dependencies)
    - [Using Bower](#using-bower)
    - [Using NPM](#using-npm)
    - [From source](#from-source)
        - [Clone repo to your local machine](#clone-repo)
        - [Setup environment](#setup-environment)
        - [Building angular-slashdb](#building-angular-slashdb)
- [Running angular-slashdb example application](#running-angular-slashdb-example-application)
    - [Python](#python)
    - [Node](#node)
- [General description](#general-description)
    - [Injecting _angularSlashDB_ into your app](#injecting-angularslashdb)
    - [Injecting and configuring _slashDBProvider_](#injecting-slashdbprovider)
        - [Default angular-slashdb configuration](#default-angular-slashdb-configuration)
        - [_slashDBProvider_ methods usage](#slashdbprovider-methods-usage)
            - [setEndpoint](#setendpoint)
            - [setCacheData](#setcachedata)
            - [setHeaders](#setheaders)
            - [setWithCredentials](#setwithcredentials)
            - [setAPIKeys](#setapikeys)
    - [Injecting _slashDB_ service](#injecting-slashdb-service)
        - [Example _slashDB_ service usage](#example-slashdb-service-usage)
        - [_slashDB_ utility methods usage](#slashdb-utility-methods-usage)
            - [get](#get)
            - [post](#post)
            - [put](#put)
            - [delete](#delete)
            - [escapeValue](#escapevalue)
            - [subscribeLogin and notifyLogin](#subscribelogin-and-notifylogin)
            - [subscribeLogout and notifyLogout](#subscribelogout-and-notifylogout)
            - [subscribeSettingsChange and notifySettingsChange](#subscribesettingschange-and-notifysettingschange)
            - [getSettings](#getSettings)
            - [login](#login)
            - [logout](#logout)
            - [isAuthenticated](#isauthenticated)
            - [uploadLicense](#uploadLicense)
            - [loadModel and unloadModel](#loadmodel-and-unloadmodel)
            - [getDBDefs and getDBDef](#getdbdefs-and-getdbdef)
            - [createDBDef, updateDBDef and deleteDBDef](#createdbdef-updatedbdef-and-deletedbdef)
            - [getUserDefs and getUserDef](#getuserdefs-and-getuserdef)
            - [createUserDef, updateUserDef and deleteUserDef](#createuserdef-updateuserdef-and-deleteuserdef)
            - [getQueryDefs and getQueryDef](#getquerydefs-and-getquerydef)
            - [createQueryDef, updateQueryDef and deleteQueryDef](#createquerydef-updatequerydef-and-deletequerydef)
            - [getQueries and executeQuery](#getqueries-and-executequery)
- [Copyright](#copyright)


# Install angular-slashdb

## Dependencies
* SlashDB >= 0.9.7
* AngularJS >= 1.5.7 and < 2.0

**[Back to top](#table-of-contents)**

## Using [Bower](https://bower.io)
    bower install angular-slashdb

**[Back to top](#table-of-contents)**

## Using [NPM](https://www.npmjs.com/package/angular-slashdb)
    npm install angular-slashdb

**[Back to top](#table-of-contents)**

## From source
You can also build from TypeScript source code.

### Clone repo:

    git clone git@github.com:SlashDB/angular-slashdb.git

**[Back to top](#table-of-contents)**

### Setup environment:

    cd angular-slashdb
    npm install -g
    typings install

**[Back to top](#table-of-contents)**

### Building angular-slashdb:

    npm run build

Now you can include _./dist/angular-slashdb.js_ in your project.

**[Back to top](#table-of-contents)**


# Running angular-slashdb example application
You can directly open _example/index.html_ in your browser of choice or use one of the following methods.

## Python
while in _example_ directory

using python3

    python -m http.server 8000

or python2

    python -m SimpleHTTPServer 8080

**[Back to top](#table-of-contents)**

## Node
install _http-server_
    
    npm install http-server -g

then, while in _example_ directory, you can simply

    http-server -p 8000

**[Back to top](#table-of-contents)**


# General description

**[Back to top](#table-of-contents)**

## Injecting _angularSlashDB_
```javascript
var exampleApp = angular.module('exampleApp', ['angularSlashDB']);
```
**[Back to top](#table-of-contents)**

## Injecting _slashDBProvider_
Configure it so that it points to your SlashDB instance i.e.:

```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // set endpoint to your slashDB instance
    slashDBProvider.setEndpoint('http://localhost:6543');
}])
```
**[Back to top](#table-of-contents)**

### Default angular-slashdb configuration:
```javascript
config = {
    endpoint: '',              // default slashDB endpoint, it's required to set this to a proper value
    cacheData: false,          // determines if cached data should be used
    apiKeys: {},               // hold optional API keys
    httpRequestConfig: {       // user provided request config
        headers: {},           // holds user provided request headers
        params: {},            // holds user provided request params i.e. {depth: 1, sort: LastName}
        withCredentials: true  // determines if cookie based authentication should be used
    }
}
```
**[Back to top](#table-of-contents)**

### _slashDBProvider_ methods usage
You can set _slashDBProvider_ fields by hand, but it's more convenient and safer to use methods provided by us.

#### setEndpoint
Sets default endpoint.

```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // by default this is set to '' so you'll need to set this to sane value
    slashDBProvider.setEndpoint('http://localhost:6543');
}])
```
**[Back to top](#table-of-contents)**

#### setCacheData
Sets _cacheData_ caching flag.

```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // by default set to true
    slashDBProvider.setCacheData(false);
}])
```
**[Back to top](#table-of-contents)**

#### setHeaders
Sets default request headers of your choice.

```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // every request made will have 'Accept=application/json' header set
    slashDBProvider.setHeaders({'Accept': 'application/json'});
}])
```
**[Back to top](#table-of-contents)**

#### setWithCredentials
Sets flag determining what method of authentication should be used.
* true - angular-shashdb will use cookie based authentication
* false - user API keys will be used

```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    slashDBProvider.setWithCredentials(false);
}])
```
**[Back to top](#table-of-contents)**

#### setAPIKeys
Sets API authentication request keys - provided by your SlashDB admin.

**Important**: this will be only used after the _(slashDB service) [login](#login)_ method has been used.

```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // 'APIKey' and 'otherKey' are examples - contact your SlashDB admin for the real thing
    // setting this will also set setWithCredentials to false
    // and every get request will have APIKey=1234&otherKey=4321 query sting attached automatically
    slashDBProvider.setAPIKeys({'APIKey': '1234', 'otherKey': '4321'});
    // using setAPIKeys with an empty object will remove all previously set API keys and set setWithCredentials to true
    // so that the default authentication behavior of using cookies will be restored
    slashDBProvider.setAPIKeys({});
}])
```
**[Back to top](#table-of-contents)**

## Injecting _slashDB_ service

### Example _slashDB_ service usage
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    var defaultData = [{ 'Name': 'AC/DC' }, { 'Name': 'Buddy Guy' }];
    var model = { data: defaultData };

    // update initial model data
    slashDB.get('/db/Chinook/Artist.json').then(function(response) {
            model.data = response.data;
        });
    });

    return model;
}])
```

**[Back to top](#table-of-contents)**

### _slashDB_ utility methods usage

#### get
Wrapper around angulars _$http.get_.

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // by passing an request config object, it's possible to control request in a fine grained manner
    // passing true as the 3rd param, will omit using cache and re-download data
    // passing false as the 4th function param, it's possible to treat returned data as a single value, rather than an array of values (the default)
    // returns a Promise for further use
    var myRequestCofig = {
        headers: { 'Accept': 'application/json' },
        params: { count: '' }
    };

    slashDB.get('/db/Chinook/Artist.json', true, myRequestCofig, false).then(function(response) {
            console.log('data received!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### post
Wrapper around angulars _$http.post_.

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // by passing an request config object, it's possible to control request in a fine grained manner
    // returns a Promise for further use
    var myRequestCofig = {
        headers: { 'Accept': 'application/json' }  // the default
    };

    var newRecordData = { 'Name': 'Killswitch Engage' };
    slashDB.post('/db/Chinook/Artist.json', newRecordData, myRequestCofig, false).then(function(response) {
            console.log('new object created!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### put
Wrapper around angulars _$http.put_.

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // by passing an request config object, it's possible to control request in a fine grained manner
    // returns a Promise for further use
    var updateRecordData = { 'Email': 'Joe@gmail.com' };
    slashDB.put('/db/Chinook/Customer/CustomerId/1.json', updateRecordData, {}, false).then(function(response) {
            console.log('object updated!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### delete
Wrapper around angulars _$http.delete_.

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // by passing an request config object, it's possible to control request in a fine grained manner
    // returns a Promise for further use
    slashDB.delete('/db/Chinook/Customer/CustomerId/1.json').then(function(response) {
            console.log('object deleted!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### escapeValue
Replaces characters using mapping defined in SlashDB settings.

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {    
    var escapedValue = slashDB.escapeValue('AC/DC');  // will return AC__DC if SlashDB is cofigured to substitute '/' with '__'
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### subscribeLogin and notifyLogin
* _subscribeLogin_ - subscribe to a login event
* _notifyLogin_ - emmit a login event

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.subscribeLogin(config.scope, function () {
        console.log('an `slashdb-service-login-event` event has occurred');
    });

    slashDB.notifyLogin();  // this will emit `slashdb-service-login-event` event and execute the callback function
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### subscribeLogout and notifyLogout
* _subscribeLogout_ - subscribe to a logout event
* _notifyLogout_ - emmit a logout event

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.subscribeLogout(config.scope, function () {
        console.log('an `slashdb-service-settings-update-event` event has occurred');
    });

    slashDB.notifyLogout();  // this will emit `slashdb-service-settings-update-event` event and execute the callback function
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### subscribeSettingsChange and notifySettingsChange
* _subscribeSettingsChange_ - subscribe to a settings change event
* _notifySettingsChange_ - emmit a settings change event

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.subscribeSettingsChange(config.scope, function () {
        console.log('an `slashdb-service-settings-update-event` event has occurred');
    });

    slashDB.notifySettingsChange();  // this will emit `slashdb-service-settings-update-event` event and execute the callback function
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### getSettings
Fetches settings object from slashDB instance.

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // this will get and/or update slashDB settings data, emit an `slashdb-service-settings-update-event`, and return a Promise for further use
    slashDB.getSettings();
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### login
Perform a login request.

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.login();  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### logout
Perform a logout request.

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.logout();  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### isAuthenticated
Checks if the user is authenticated.

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    if (slashDB.isAuthenticated()); {
        console.log('doing something');
    } else {
        console.log('doing something else');
    }
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### uploadLicense
Uploads licence file data to slashDB instance.

```javascript
exampleApp.component('myComponent', {
    template: '<form name="form" ng-submit="$ctrl.submit()">' +
                '<input type="file" ng-model="$ctrl.myModel.license" name="license" />' +
                '<button type="submit" class="btn btn-primary">Send license</button>' +
              '</form>',
    controller: function ($element, slashDB) {
        var ctrl = this;
        ctrl.submit = function(e) {
            var licenseFile = $element[0].childNodes[0].childNodes[0].files[0]);
            slashDB.uploadLicense(licenseFile);
        }
    }
})
```
**[Back to top](#table-of-contents)**

#### loadModel and unloadModel
* _loadModel_ - connects a given database on the backend
* _unloadModel_ - disconnects a given database on the backend

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.loadModel();    // returns a Promise for further use
    slashDB.unloadModel();  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### getDBDefs and getDBDef
* _getDBDefs_ - perform a request for definitions for all databases
* _getDBDef_ - perform a request for definition for a given database

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // get all DB definition
    slashDB.getDBDefs(true);       // returns a Promise for further use, passing true will omit using cache and re-download data
    // get just a selected DB definition
    slashDB.getDBDef('Customer');  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### createDBDef, updateDBDef and deleteDBDef
* _createDBDef_ - create a new database definition
* _updateDBDef_ - update a database definition
* _deleteDBDef_ - delete a database definition

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // newDBDef might have a diffrent 'shape' on your version of SlashDB
    var newDBDef = {
        'db_encoding': 'utf-8',
        'owners': ['admin'],
        'execute': [],
        'creator': 'admin',
        'read': [],
        'db_type': 'sqllite3',
        'autoload': false,
        'write': [];
        'connect_status': '',
        'connection': '',
        'foreign_keys': {},
        'sysuser': {'dbuser': 'admin', 'dbpass': 'admin'},
        'db_schema': '',
        'offline': false,
        'alternate_key': {},
        'excluded_columns': {},
        'desc': '';
    };
    // create a new DB definition
    slashdb.createDBDef('newDBDef', newDBDef).then(function() {
        console.log('new db def created!');
    });
    // update definition
    slashdb.updateDBDef('newDBDef', {'owners': ['me', 'joe']});
    // delete definition
    slashdb.deleteDBDef('newDBDef').then(function() {
        console.log('it is gone!');
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### getUserDefs and getUserDef
* _getUserDefs_ - perform a request for definitions for all users
* _getUserDef_ - perform a request for definition for a given user

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // get all User definition
    slashDB.getUserDefs(true);    // returns a Promise for further use, passing true will omit using cache and re-download data
    // get just a selected User definition
    slashDB.getUserDef('admin');  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### createUserDef, updateUserDef and deleteUserDef
* _createUserDef_ - create a new user definition
* _updateUserDef_ - update a user definition
* _deleteUserDef_ - delete a user definition

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // newUserDef might have a diffrent 'shape' on your version of SlashDB
    var newUserDef = {
        'userdef': ['newUserDef'],
        'api_key': 'somekey',
        'name': 'newQueryDef',
        'creator': 'admin',
        'edit': [];
        'dbdef': ['someDBDef'];
        'querydef': [];
        'databases': {'dbuser': 'me', 'dbpass': 'mypass'},
        'password': 'mypass';
        'email': 'me@me.com';
        'view': '';
    };
    // create a new User definition
    slashdb.createDBDef('newUserDef', newUserDef).then(function() {
        console.log('new user def created!');
    });
    // update definition
    slashdb.updateDBDef('newUserDef', {'email': 'newMe@me.com'});
    // delete definition
    slashdb.deleteDBDef('newUserDef').then(function() {
        console.log('it is gone!');
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### getQueryDefs and getQueryDef
* _getQueryDefs_ - perform a request for definitions for all queries
* _getQueryDef_ - perform a request for definition for a given query

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // get all Query definition
    slashDB.getQueryDefs(true);                // returns a Promise for further use, passing true will omit using cache and re-download data
    // get just a selected Query definition
    slashDB.getQueryDef('customers-in-city');  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### createQueryDef, updateQueryDef and deleteQueryDef
* _createUserDef_ - create a new query definition
* _updateUserDef_ - update a query definition
* _deleteUserDef_ - delete a query definition

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // newQueryDef might have a diffrent 'shape' on your version of SlashDB
    var newQueryDef = {
        'owners': ['me'],
        'viewable': true,
        'creator': 'me',
        'read': [],
        'database': 'someDB',
        'execute': [],
        'write': [],
        'sqlstr': '',
        'executable': true,
        'columns': 'Name'
    };
    // create a new Query definition
    slashdb.createDBDef('newQueryDef', newQueryDef).then(function() {
        console.log('new query def created!');
    });
    // update definition
    slashdb.updateDBDef('newQueryDef', {'email': 'newMe@me.com'});
    // delete definition
    slashdb.deleteDBDef('newQueryDef').then(function() {
        console.log('it is gone!');
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### getQueries and executeQuery
* _getQueries_ - perform a request for a list available SQL Pass-thru queries
* _executeQuery_ - execute SQL Pass-thru query

```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.getQueries(true).then(function(response) {  // returns a Promise for further use, passing true will omit using cache and re-download data
        var data = response.data;                       // i.e. response.data = {
                                                        //   "customers-in-city": {
                                                        //       "desc": "Customer phone list by city (i.e. London)",
                                                        //       "parameters": [
                                                        //           "city"
                                                        //       ],
                                                        //       "database": "Chinook"
                                                        //   },
                                                        //   "sales-by-year": {
                                                        //       "desc": "Sales Total by Year",
                                                        //       "parameters": [],
                                                        //       "database": "Chinook"
                                                        //   }
                                                        // }
        // lets use 'customers-in-city' with 'city' parameter and 'Chicago' as the city
        slashDB.executeQuery('/customers-in-city/city/Chicago.json').then(function(response) {
            console.log('a Pass-thru query is done!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**


# Copyright
#### Copyright (C) 2016, VT Enterprise LLC. SlashDB and angular-slashdb are products of [VT Enterprise LLC](http://vtenterprise.com/).

**[Back to top](#table-of-contents)**
