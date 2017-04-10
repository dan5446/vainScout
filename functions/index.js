"use strict";
exports.__esModule = true;
var functions = require("firebase-functions");
var admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
var requestMatches = function (ref) {
    // ref.root('matchRequest').pust
    console.log('requesting match calls here');
};
exports.processPlayerQueue = functions.database.ref('/requestQueue/{playerId}')
    .onWrite(function (event) {
    var requestedId = event.params.playerId;
    var requested = event.data.val();
    console.log('requestedId: ', requestedId, '\r\n,', 'requestBody: ', requested);
    if (requested === null) {
        console.log('Cleaning up');
        return 1;
    }
    var metaPath = '/region/' + requested.region + '/playerMeta/' + requested.name;
    var latestMatchPath = metaPath + '/latestMatch';
    event.data.adminRef.root.child(latestMatchPath).once('value')
        .then(function (data) {
        var latest = data.val();
        if (latest === null) {
            latest = '02-14-2017T00:00:00:001Z';
            event.data.adminRef.root.child(metaPath + '/latestMatch').set('02-02-2017T00:00:00:001Z');
        }
        else {
            event.data.adminRef.root.child(metaPath + '/latestMatch').set('02-02-2017T00:00:00:001Z');
        }
        event.data.adminRef.root.child('apiQueue').push({ region: requested.region, name: requested.name, from: latest });
        console.log('Latest Match', latest);
        console.log({ region: requested.region, name: requested.name, from: latest });
        event.data.ref.set(null);
    });
});
