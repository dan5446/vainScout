import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as request from 'request-promise';
import { VgApiResponse, FlatMatch, FlatPlayer } from './datatypes';

admin.initializeApp(functions.config().firebase);

export const processPlayerQueue =
    functions.database.ref('/playerQueue/{region}/{playerName}')
        .onWrite(event => {
            const region = event.params['region'];
            const playerName = event.params['playerName'];
            const payload = event.data.val();
            console.log('region: ', region, '\r\n,', 'playerName: ', playerName);
            if (payload === null) {
                console.log('Cleaning up');
                return 1;
            }
            event.data.adminRef.root.child(`/players/${region}/${playerName}/matches`).once('value')
                .then((data: admin.database.DataSnapshot) => {
                    const matchDict: Object = data.val();
                    const matchIds = Object.keys(matchDict);
                    const earliest = matchDict[matchIds[0]];
                    const latest = matchDict[matchIds[matchIds.length - 1]];
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

function addPlayer(flatPlayer: FlatPlayer, region: string, event: any) {
    return event.data.adminRef.root.child('/players/' + region + '/' + flatPlayer.name).update({...flatPlayer});
}

function addMatches (matches: FlatMatch[], playerName: string, region: string, event: any) {
    const matchId = (match) => (new Date(match.createdAt).getTime() / 1000).toString() + match.id;
    const matchMetaAdd = (name, match: FlatMatch) =>
        event.data.adminRef.root.child('/players/' + region + '/' + name + '/matches/' + matchId(match)).set(match.createdAt);
    matches.map(match => event.data.adminRef.root.child('/matches/' + region + '/' + matchId(match)).set(match));
    matches.map(match => matchMetaAdd(playerName, match));
    matches.map(m => m.players.map(player => addPlayer(player, region, event)));
    matches.map(match => match.players.map(p => matchMetaAdd(p.name, match)));
}

// export const processMatchRequestQueue =
//     functions.database.ref('/apiQueue/{region}/{playerId}')
//         .onWrite(event => {
//             console.log(event);
//             const playerName = event.params['playerId'];
//             const region = event.params['region'];
//             const time = event.data.val();
//             if (time === null) { return 1; }
//             const uri = 'https://api.dc01.gamelockerapp.com/shards/' + region + '/matches';
//             console.log(uri, time, region, playerName);
//             const options = {
//                 uri: uri,
//                 qs: {
//                     'filter[playerNames]': playerName,
//                     'filter[createdAt-start]': '2017-02-13T00:00:01Z',
//                     sort: '-createdAt'
//                 },
//                 headers: {
//                     'Accept': 'application/vnd.api+json',
//                     'X-TITLE-ID': 'semc-vainglory',
//                     'Authorization': functions.config().api.key,
//                 },
//                 json: true // Automatically parses the JSON string in the response 
//             };

//             request(options)
//                 .then((matches) => {
//                     // console.log(matches);
//                     // console.log(new VgApiResponse(matches));
//                     console.log('request returned %d matches', matches.data.length);
//                     let orderedFlatMatches = [];
//                     matches.data.forEach((match, index) => orderedFlatMatches.push(new FlatMatch(matches, index)));
//                     orderedFlatMatches = orderedFlatMatches.sort(
//                         (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
//                     );
//                     orderedFlatMatches.forEach(match => console.log(match));
//                     event.data.adminRef.set(null);
//                     addMatches(orderedFlatMatches, playerName, region, event);
//                 })
//                 .catch(function (err) {
//                     // API call failed...
//                     console.log(err);
//                 });
//                 event.data.ref.set(null);
//         });

