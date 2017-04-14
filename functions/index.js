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
exports.processPlayerQueue = functions.database.ref('/playerQueue/{region}/{playerName}')
    .onWrite(function (event) {
    var region = event.params['region'];
    var playerName = event.params['playerName'];
    var payload = event.data.val();
    console.log('region: ', region, '\r\n,', 'playerName: ', playerName);
    if (payload === null) {
        console.log('Cleaning up');
        return 1;
    }
    event.data.adminRef.root.child("/players/" + region + "/" + playerName + "/matches").once('value')
        .then(function (data) {
        var matchDict = data.val();
        var matchIds = Object.keys(matchDict);
        var earliest = matchDict[matchIds[0]];
        var latest = matchDict[matchIds[matchIds.length - 1]];
        console.log(earliest, latest);
        // if (latest === null) {
        //     latest = moment('2017-02-13T00:00:01Z');
        //     console.log('no latest match setting to: ', latest.toISOString());
        //     event.data.adminRef.root.child(metaPath).update({ latestMatch: latest.toISOString() });
        // } else {
        //     latest = moment(latest);
        //     event.data.adminRef.root.child(metaPath + '/latestMatch').set(latest.add(1, 'second').toISOString());
        //     console.log('latest was found incrementing: ', latest.add(1, 'second').toISOString());
        // }
        // console.log('Latest Match value before increment: ', latest);
        // console.log('parameters: ', { region: requested.region, name: requested.name, from: latest });
        // event.data.adminRef.root.child('apiQueue/' + requested.region + '/' + requested.name)
        //     .set({ time: latest.toISOString() });
        // event.data.ref.set(null);
    });
});
function addPlayer(flatPlayer, region, event) {
    return event.data.adminRef.root.child('/players/' + region + '/' + flatPlayer.name).update(__assign({}, flatPlayer));
}
function addMatches(matches, playerName, region, event) {
    var matchId = function (match) { return (new Date(match.createdAt).getTime() / 1000).toString() + match.id; };
    var matchMetaAdd = function (name, match) {
        return event.data.adminRef.root.child('/players/' + region + '/' + name + '/matches/' + matchId(match)).set(match.createdAt);
    };
    matches.map(function (match) { return event.data.adminRef.root.child('/matches/' + region + '/' + matchId(match)).set(match); });
    matches.map(function (match) { return matchMetaAdd(playerName, match); });
    matches.map(function (m) { return m.players.map(function (player) { return addPlayer(player, region, event); }); });
    matches.map(function (match) { return match.players.map(function (p) { return matchMetaAdd(p.name, match); }); });
}
exports.processMatchRequestQueue = functions.database.ref('/apiQueue/{region}/{playerId}')
    .onWrite(function (event) {
    console.log(event);
    var playerName = event.params['playerId'];
    var region = event.params['region'];
    var time = event.data.val();
    if (time === null) {
        return 1;
    }
    var uri = 'https://api.dc01.gamelockerapp.com/shards/' + region + '/matches';
    console.log(uri, time, region, playerName);
    var options = {
        uri: uri,
        qs: {
            'filter[playerNames]': playerName,
            'filter[createdAt-start]': '2017-02-13T00:00:01Z',
            sort: '-createdAt'
        },
        headers: {
            'Accept': 'application/vnd.api+json',
            'X-TITLE-ID': 'semc-vainglory',
            'Authorization': functions.config().api.key
        },
        json: true // Automatically parses the JSON string in the response 
    };
    request(options)
        .then(function (matches) {
        // console.log(matches);
        // console.log(new VgApiResponse(matches));
        console.log('request returned %d matches', matches.data.length);
        var orderedFlatMatches = [];
        matches.data.forEach(function (match, index) { return orderedFlatMatches.push(new datatypes_1.FlatMatch(matches, index)); });
        orderedFlatMatches = orderedFlatMatches.sort(function (a, b) { return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf(); });
        orderedFlatMatches.forEach(function (match) { return console.log(match); });
        event.data.adminRef.set(null);
        addMatches(orderedFlatMatches, playerName, region, event);
    })["catch"](function (err) {
        // API call failed...
        console.log(err);
    });
    event.data.ref.set(null);
});
