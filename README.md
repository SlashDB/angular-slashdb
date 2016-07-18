angular-slashdb - AngularJS bindings to [SlashDB](http://www.slashdb.com/)
=========

Angular-shlashdb is a small plug-in, allowing you to user [SlashDB](http://www.slashdb.com/) features more easily in your AngularJS app.
This plug-in depends on:
* SlashDB >= 0.9.7
* AngularJS >= 1.5.7 and < 2.0

Installing angular-shashdb
-------

## Install using [Bower](https://bower.io)
    bower install angular-shlashdb

## or using [NPM](https://www.npmjs.com/package/angular-slashdb)
    npm install angular-shlashdb

## You can also build from TypeScript source code.
### Clone this repo to your local machine

    git clone git@github.com:SlashDB/angular-slashdb.git

## Setup environment:
    cd angular-slashdb
    npm install -g
    typings install


## Building angular-slashdb
    npm run build


Running angular-slashdb example application
---------
using python3

    python -m http.server 8000

or python2

    python -m SimpleHTTPServer 8080


Usage
--------
## Inject _angularSlashDB_ into your app
```javascript
var exampleApp = angular.module('exampleApp', ['angularSlashDB']);
```

## Inject _slashDBProvider_ and configure it to point to your SlashDB instance
```javascript
exampleApp.config(['$httpProvider', 'slashDBProvider', function ($httpProvider, slashDBProvider) {
    // set endpoint to your slashDB instance or leve it pointing to the demo
    slashDBProvider.setEndpoint('http://localhost:6543');
    // caching is ON by default, in this example we'll turn it OFF
    slashDBProvider.setCacheData(false);
}])
```

## Here is the default angular-shlashdb config object:
```javascript
config = {
    endpoint: '',              // default shashDB endpoint
    cacheData: false,          // determines if cached data should be used
    apiKeys: {},               // hold optional API keys
    httpRequestConfig: {       // user provided request config
        headers: {},           // holds user provided request headers
        params: {},            // holds user provided request params i.e. {depth: 1, sort: LastName}
        withCredentials: true  // determines if cookie based authentication should be used
    }
}
```

### You can set its values by hand or use some of the convenience methods we provide with _slashDBProvider_ i.e.

## setEndpoint
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // by default this is set to '' so you'll need to set this so same value
    slashDBProvider.setEndpoint('http://localhost:6543');
}])
```

## setCacheData
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // by default set to true
    slashDBProvider.setCacheData(false);
}])
```

## setHeaders
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    slashDBProvider.setHeaders({'Accpet': 'application/json'});
}])
```

## setParams
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    slashDBProvider.setParams({'offset': 2, 'sort': 'LastName', 'distinct': ''});
}])
```

## setParams
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    slashDBProvider.setParams({'offset': 2, 'sort': 'LastName', 'distinct': ''});
}])
```

## setWithCredentials
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    slashDBProvider.setWithCredentials(false);
}])
```

## setAPIKey
```javascript
exampleApp.config(['slashDBProvider', function (slashDBProvider) {
    // setting this will also set setWithCredentials to false
    slashDBProvider.setAPIKey({'myMagicAPIKey': '1234', 'otherKey': '4321'});
    // using setAPIKey with an empty object will remove all previously set API keys and set setWithCredentials to true
    slashDBProvider.setAPIKey({});
}])
```

### We also provide an injectable _slashDB_ service


## get
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


## post
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

## put
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

## delete
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

## injecting into a user defined service
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    return {
        data: [{name: 'Ike'}, {name: 'Ann'}]
    };
}])
```


## subscribeLogin and notifyLogin
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.subscribeLogin(config.scope, function () {
        console.log('an `slashdb-service-login-event` event has occured');
    });

    slashDB.notifyLogin();  // this will emit `slashdb-service-login-event` event and execute the callback function
    return {};
}])
```

## subscribeLogout and notifyLogout
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.subscribeLogout(config.scope, function () {
        console.log('an `slashdb-service-settings-update-event` event has occured');
    });

    slashDB.notifyLogout();  // this will emit `slashdb-service-settings-update-event` event and execute the callback function
    return {};
}])
```

## subscribeSettingsChange and notifySettingsChange
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.subscribeSettingsChange(config.scope, function () {
        console.log('an `slashdb-service-settings-update-event` event has occured');
    });

    slashDB.notifySettingsChange();  // this will emit `slashdb-service-settings-update-event` event and execute the callback function
    return {};
}])
```

## getSettings
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // this will get and/or update slashDB settings data, emit an `slashdb-service-settings-update-event`, and return a Promise for further use
    slashDB.getSettings();
    return {};
}])
```

## login
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.login();  // returns a Promise for further use
    return {};
}])
```

## logout
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.logout();  // returns a Promise for further use
    return {};
}])
```

## uploadLicense
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
});
```

## loadModel and unloadModel
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    slashDB.loadModel();    // returns a Promise for further use
    slashDB.unloadModel();  // returns a Promise for further use
    return {};
}])
```

## getDBDefs and getDBDef
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // get all DB definition
    slashDB.getDBDefs(true);      // returns a Promise for further use, passing true will omit using cache and re-download data
    // get just a selected DB definition
    slashDB.getDBDef('myDBDef');  // returns a Promise for further use
    return {};
}])
```

# createDBDef and updateDBDef and deleteDBDef
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


## getUserDefs and getUserDef
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // get all User definition
    slashDB.getUserDefs(true);        // returns a Promise for further use, passing true will omit using cache and re-download data
    // get just a selected User definition
    slashDB.getUserDef('myUserDef');  // returns a Promise for further use
    return {};
}])
```

# createUserDef and updateUserDef and deleteUserDef
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


## getQueryDefs and getQueryDef
```javascript
exampleApp.service('myService', ['slashDB', function (slashDB) {
    // get all Query definition
    slashDB.getQueryDefs(true);         // returns a Promise for further use, passing true will omit using cache and re-download data
    // get just a selected Query definition
    slashDB.getQueryDef('myQueryDef');  // returns a Promise for further use
    return {};
}])
```

# createQueryDef and updateQueryDef and deleteQueryDef
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

## isAuthenticated
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

## getQueries and executeQuery
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


What to use angular-slashdb for and when to use it
---------


#### Copyright (C) 2016, VT Enterprise LLC. SlashDB and angular-shlashdb are products of [VT Enterprise LLC](http://vtenterprise.com/).
