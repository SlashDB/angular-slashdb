angular-slashdb - AngularJS bindings to [SlashDB](http://www.slashdb.com/)
=========

[SlashDB](http://www.slashdb.com/) automatically creates REST APIs on top of traditional databases for reading and writing by authorized applications without the need of SQL queries. Angular-slashdb is a small plug-in, allowing you to use SlashDB features more easily in your AngularJS app. Together they allow developers to avoid tedious work and focus on application features that matter.

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
- [General usage](#general-usage)
    - [Injecting _angularSlashDB_ into your app](#injecting-angularslashdb)
    - [Injecting and configuring _slashDBProvider_](#injecting-slashdbprovider)
        - [Default configuration](#default-angular-shlashdb-configuration)
        - [_slashDBProvider_ methods usage](#slashdbprovider-methods-usage)
            - [setEndpoint](#setendpoint)
            - [setCacheData](#setcachedata)
            - [setHeaders](#setheaders)
            - [setParams](#setparams)
            - [setWithCredentials](#setwithcredentials)
            - [setAPIKey](#setapikey)
    - [Injecting _slashDB_ service](#injecting-slashdb-service)
        - [Example _slashDB_ service usage](#example-slashdb-service-usage)
        - [_slashDB_ utility methods usage](#slashdb-utility-methods-usage)
            - [get](#get)
            - [post](#post)
            - [put](#put)
            - [delete](#delete)
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
    bower install angular-shlashdb

**[Back to top](#table-of-contents)**

## Using [NPM](https://www.npmjs.com/package/angular-slashdb)
    npm install angular-shlashdb

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

**[Back to top](#table-of-contents)**

# Running angular-slashdb example application
using python3

    python -m http.server 8000

or python2

    python -m SimpleHTTPServer 8080

**[Back to top](#table-of-contents)**

# General usage

## Injecting _angularSlashDB_
```javascript
var exampleApp = angular.module('exampleApp', ['angularSlashDB']);
```
**[Back to top](#table-of-contents)**

## Injecting _slashDBProvider_
Configure it so that it points to your SlashDB instance i.e.:
```javascript
exampleApp.config(['$httpProvider', 'slashDBProvider', function ($httpProvider, slashDBProvider) {
    // set endpoint to your slashDB instance or leve it pointing to the demo
    slashDBProvider.setEndpoint('http://localhost:6543');
}])
```
**[Back to top](#table-of-contents)**

### Default angular-shlashdb configuration:
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
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // by default this is set to '' so you'll need to set this so sane value
    slashDBProvider.setEndpoint('http://localhost:6543');
}])
```
**[Back to top](#table-of-contents)**

#### setCacheData
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // by default set to true
    slashDBProvider.setCacheData(false);
}])
```
**[Back to top](#table-of-contents)**

#### setHeaders
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    slashDBProvider.setHeaders({'Accpet': 'application/json'});
}])
```
**[Back to top](#table-of-contents)**

#### setParams
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    slashDBProvider.setParams({'offset': 2, 'sort': 'LastName', 'distinct': ''});
}])
```
**[Back to top](#table-of-contents)**

#### setWithCredentials
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    slashDBProvider.setWithCredentials(false);
}])
```
**[Back to top](#table-of-contents)**

#### setAPIKey
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // setting this will also set setWithCredentials to false
    slashDBProvider.setAPIKey({'myMagicAPIKey': '1234', 'otherKey': '4321'});
    // using setAPIKey with an empty object will remove all previously set API keys and set setWithCredentials to true
    slashDBProvider.setAPIKey({});
}])
```
**[Back to top](#table-of-contents)**

## Injecting _slashDB_ service

### Example _slashDB_ service usage
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    var defaultData = [{ name: 'Ike' }, { name: 'Ann' }];
    var model = { data: defaultData };

    // update initial model data
    slashDB.get('/myDB/People.json').then(function(response) {
            model.data = response.data;
        });
    });

    return model;
}])
```
see example application folder for more details.

**[Back to top](#table-of-contents)**

### _slashDB_ utility methods usage

#### get
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // by passing an request config object, it's possible to control request in a fine grained manner
    // passing true as the 3rd param, will omit using cache and re-download data
    // passing false as the 4th function param, it's possible to treat returned data as a single value, rather than an array of values (the default)
    // returns a Promise for further use
    var myRequestCofig = {
        headers: { 'Accpet': 'application/json' },
        params: { count: ''}
    };
    slashDB.get('/myDB/myTable.json', true, myRequestCofig, false).then(function(response) {
            console.log('data received!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### post
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // by passing an request config object, it's possible to control request in a fine grained manner
    // returns a Promise for further use
    var myRequestCofig = {
        headers: { 'Accpet': 'application/json' }  // the default
    };
    var newRecordData = { 'Name': 'Joe' };
    slashDB.post('/myDB/myTable.json', newRecordData, myRequestCofig, false).then(function(response) {
            console.log('new object created!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### put
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // by passing an request config object, it's possible to control request in a fine grained manner
    // returns a Promise for further use
    var updateRecordData = { 'Email': 'Joe@gmail.com' };
    slashDB.put('/myDB/myTable/1.json', updateRecordData, {}, false).then(function(response) {
            console.log('object updated!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### delete
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // by passing an request config object, it's possible to control request in a fine grained manner
    // returns a Promise for further use
    slashDB.delete('/myDB/myTable/1.json').then(function(response) {
            console.log('object deleted!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### subscribeLogin and notifyLogin
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.subscribeLogin(config.scope, function () {
        console.log('an `slashdb-service-login-event` event has occured');
    });

    slashDB.notifyLogin();  // this will emit `slashdb-service-login-event` event and execute the callback function
    return {};
}])
```

#### subscribeLogout and notifyLogout
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.subscribeLogout(config.scope, function () {
        console.log('an `slashdb-service-settings-update-event` event has occured');
    });

    slashDB.notifyLogout();  // this will emit `slashdb-service-settings-update-event` event and execute the callback function
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### subscribeSettingsChange and notifySettingsChange
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.subscribeSettingsChange(config.scope, function () {
        console.log('an `slashdb-service-settings-update-event` event has occured');
    });

    slashDB.notifySettingsChange();  // this will emit `slashdb-service-settings-update-event` event and execute the callback function
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### getSettings
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // this will get and/or update slashDB settings data, emit an `slashdb-service-settings-update-event`, and return a Promise for further use
    slashDB.getSettings();
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### login
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.login();  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### logout
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.logout();  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### isAuthenticated
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
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.loadModel();    // returns a Promise for further use
    slashDB.unloadModel();  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### getDBDefs and getDBDef
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // get all DB definition
    slashDB.getDBDefs(true);      // returns a Promise for further use, passing true will omit using cache and re-download data
    // get just a selected DB definition
    slashDB.getDBDef('myDBDef');  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### createDBDef, updateDBDef and deleteDBDef
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    var newDBDef = {
        'db_encoding': 'utf-8',
        'owners': ['me'],
        'execute': [],
        'creator': 'me',
        'read': [],
        'db_type': 'sqllite3',
        'autoload': false,
        'write': [];
        'connect_status': '',
        'connection': '',
        'foreign_keys': {},
        'sysuser': {'dbuser': 'me', 'dbpass': 'mypass'},
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
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // get all User definition
    slashDB.getUserDefs(true);        // returns a Promise for further use, passing true will omit using cache and re-download data
    // get just a selected User definition
    slashDB.getUserDef('myUserDef');  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### createUserDef, updateUserDef and deleteUserDef
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    var newUserDef = {
        'userdef': ['me'],
        'api_key': 'somekey',
        'name': 'newQueryDef',
        'creator': 'me',
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
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // get all Query definition
    slashDB.getQueryDefs(true);         // returns a Promise for further use, passing true will omit using cache and re-download data
    // get just a selected Query definition
    slashDB.getQueryDef('myQueryDef');  // returns a Promise for further use
    return {};
}])
```
**[Back to top](#table-of-contents)**

#### createQueryDef, updateQueryDef and deleteQueryDef
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
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
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.getQueries(true).then(function(response) {  // returns a Promise for further use, passing true will omit using cache and re-download data
        var data = response.data;                       // i.e. ['fist', second]
        slashDB.executeQuery(data[0]).then(function(response) {
            console.log('a Pass-thru query is done!');
        });
    });
    return {};
}])
```
**[Back to top](#table-of-contents)**

# Copyright
#### Copyright (C) 2016, VT Enterprise LLC. SlashDB and angular-shlashdb are products of [VT Enterprise LLC](http://vtenterprise.com/).

**[Back to top](#table-of-contents)**
