"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var functions = require("firebase-functions");
var admin = require("firebase-admin");
var moment = require("moment");
var request = require("request-promise");
var datatypes_1 = require("./datatypes");
admin.initializeApp(functions.config().firebase);
var earliestMatchTimeString = moment('2017-02-14T00:00:01Z').toISOString();
var baseApiUrl = 'https://api.dc01.gamelockerapp.com/shards/';
var addNextApiRequest = function (event, region, playerName) {
    event.data.adminRef.root.child("/players/" + region + "/" + playerName + "/matches").once('value')
        .then(function (data) {
        var matchDict = data.val();
        if (!matchDict) {
            console.error("No matches have been logged for " + region + "/" + playerName);
            // event.data.ref.set(null);
            return -1;
        }
        var matchIds = Object.keys(matchDict);
        var earliest = matchDict[matchIds[0]];
        var queries = {
            'sort': '-createdAt',
            'filter%5BplayerNames%5D': playerName,
            'filter%5BcreatedAt-start%5D': earliestMatchTimeString,
            'filter%5BcreatedAt-end%5D': moment(earliest).subtract(1, 'minutes').toISOString()
        };
        event.data.adminRef.root.child("/apiQueue/" + region + "/" + playerName).set(queries);
        console.log('An api request has been set with the following queries: ', JSON.stringify(queries, null, 2));
    });
    event.data.ref.set(null);
};
// Executable Firebase Function
exports.matchRequestProducer = 
// A user has entered a valid region and playername in the ui
// the front-end has made a api call to fetch the player object and
// a data call for the latest up to 50 matches. The database has been filled
// with that data and after has entered a request on the playerQueue
functions.database.ref('/playerQueue/{region}/{playerName}')
    .onWrite(function (event) {
    var region = event.params['region'];
    var playerName = event.params['playerName'];
    var payload = event.data.val();
    console.log('region: ', region, '\r\n,', 'playerName: ', playerName);
    if (payload === null) {
        console.log('[PlayerQueue] delete event execution');
        return 1;
    }
    addNextApiRequest(event, region, playerName);
});
var addPlayer = function (flatPlayer, region, event) {
    return event.data.adminRef.root.child("/players/" + region + "/" + flatPlayer.name).update(__assign({}, flatPlayer));
};
var addMatches = function (matches, playerName, region, event) {
    var matchId = function (match) { return (new Date(match.createdAt).getTime() / 1000).toString() + match.id; };
    var matchMetaAdd = function (name, match) {
        return event.data.adminRef.root.child("/players/" + region + "/" + name + "/matches/" + matchId(match)).set(match.createdAt);
    };
    matches.map(function (match) { return event.data.adminRef.root.child("/matches/" + region + "/" + matchId(match)).set(match); });
    matches.map(function (match) { return matchMetaAdd(playerName, match); });
    matches.map(function (m) { return m.players.map(function (player) { return addPlayer(player, region, event); }); });
    matches.map(function (match) { return match.players.map(function (p) { return matchMetaAdd(p.name, match); }); });
};
// Executable Firebase Function
exports.matchRequestConsumer = functions.database.ref('/apiQueue/{region}/{playerName}')
    .onWrite(function (event) {
    var region = event.params.region;
    var playerName = event.params.playerName;
    var query = event.data.val();
    if (query === null) {
        console.log('[ApiQueue] delete event execution');
        return 1;
    }
    console.log("[ApiConsumer] " + playerName + " " + region + " " + JSON.stringify(query, null, 2));
    var options = {
        uri: baseApiUrl + "/shards/" + region + "/matches",
        qs: query,
        headers: {
            'Accept': 'application/vnd.api+json',
            'X-TITLE-ID': 'semc-vainglory',
            'Authorization': functions.config().api.key
        },
        json: true
    };
    request(options)
        .then(function (matches) {
        console.log("[ApiRequest] returned " + matches.data.length + " matches");
        var orderedFlatMatches = [];
        matches.data.forEach(function (match, index) { return orderedFlatMatches.push(new datatypes_1.FlatMatch(matches, index)); });
        orderedFlatMatches = orderedFlatMatches.sort(function (a, b) { return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(); });
        orderedFlatMatches.forEach(function (match) { return console.log(match); });
        event.data.adminRef.set(null);
        // addMatches(orderedFlatMatches, playerName, region, event);
    })["catch"](function (err) {
        // API call failed...
        console.log(err);
    });
    // event.data.ref.set(null);
});
