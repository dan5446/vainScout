import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as request from 'request-promise';
import { VgApiResponse, FlatMatch, FlatPlayer } from './datatypes';

admin.initializeApp(functions.config().firebase);

const earliestMatchTimeString = moment('2017-02-14T00:00:01Z').toISOString();
const baseApiUrl = 'https://api.dc01.gamelockerapp.com/shards/';

const addNextApiRequest = (event, region, playerName) => {
    event.data.adminRef.root.child(`/players/${region}/${playerName}/matches`).once('value')
        .then((data: admin.database.DataSnapshot) => {
            const matchDict: { matchId: string, createdAt: string } = data.val();
            if (!matchDict) {
                console.error(`No matches have been logged for ${region}/${playerName}`);
                // event.data.ref.set(null);
                return -1;
            }
            const matchIds = Object.keys(matchDict);
            const earliest = matchDict[matchIds[0]];
            const queries = {
                'sort': '-createdAt',
                'filter%5BplayerNames%5D': playerName,
                'filter%5BcreatedAt-start%5D': earliestMatchTimeString,
                'filter%5BcreatedAt-end%5D': moment(earliest).subtract(1, 'minutes').toISOString()
            }
            event.data.adminRef.root.child(`/apiQueue/${region}/${playerName}`).set(queries);
            console.log('An api request has been set with the following queries: ', JSON.stringify(queries, null, 2));
        });
    event.data.ref.set(null);
};

// Executable Firebase Function
export const matchRequestProducer =
    // A user has entered a valid region and playername in the ui
    // the front-end has made a api call to fetch the player object and
    // a data call for the latest up to 50 matches. The database has been filled
    // with that data and after has entered a request on the playerQueue
    functions.database.ref('/playerQueue/{region}/{playerName}')
        // We async listen to additions to the playerQueue
        .onWrite(event => {
            const region = event.params['region'];
            const playerName = event.params['playerName'];
            const payload = event.data.val();
            console.log('region: ', region, '\r\n,', 'playerName: ', playerName);
            if (payload === null) {
                console.log('[PlayerQueue] delete event execution');
                return 1;
            }
            addNextApiRequest(event, region, playerName);
        });


const addPlayer = (flatPlayer: FlatPlayer, region: string, event: any)  => 
    event.data.adminRef.root.child(`/players/${region}/${flatPlayer.name}`).update({...flatPlayer});

const addMatches = (matches: FlatMatch[], playerName: string, region: string, event: any) => {
    const matchId = (match) => (new Date(match.createdAt).getTime() / 1000).toString() + match.id;
    const matchMetaAdd = (name, match: FlatMatch) =>
        event.data.adminRef.root.child(`/players/${region}/${name}/matches/${matchId(match)}`).set(match.createdAt);
    matches.map(match => event.data.adminRef.root.child(`/matches/${region}/${matchId(match)}`).set(match));
    matches.map(match => matchMetaAdd(playerName, match));
    matches.map(m => m.players.map(player => addPlayer(player, region, event)));
    matches.map(match => match.players.map(p => matchMetaAdd(p.name, match)));
};

// Executable Firebase Function
export const matchRequestConsumer =
    functions.database.ref('/apiQueue/{region}/{playerName}')
        .onWrite(event => {
            const region = event.params.region;
            const playerName = event.params.playerName;
            const query = event.data.val();
            if (query === null) {
                console.log('[ApiQueue] delete event execution');
                return 1;
            }
            console.log(`[ApiConsumer] ${playerName} ${region} ${JSON.stringify(query, null, 2)}`);
            const options = {
                uri: `${baseApiUrl}/${region}/matches`,
                qs: query,
                headers: {
                    'Accept': 'application/vnd.api+json',
                    'X-TITLE-ID': 'semc-vainglory',
                    'Authorization': functions.config().api.key,
                },
                json: true // Automatically parses the JSON string in the response
            };
            request(options)
                .then((matches) => {
                    console.log(`[ApiRequest] returned ${matches.data.length} matches`);
                    let orderedFlatMatches = [];
                    matches.data.forEach((match, index) => orderedFlatMatches.push(new FlatMatch(matches, index)));
                    orderedFlatMatches = orderedFlatMatches.sort(
                        (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
                    );
                    orderedFlatMatches.forEach(match => console.log(match));
                    event.data.adminRef.set(null);
                    // addMatches(orderedFlatMatches, playerName, region, event);
                })
                .catch(function (err) {
                    // API call failed...
                    console.log(err);
                });
                // event.data.ref.set(null);
        });


