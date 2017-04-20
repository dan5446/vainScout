import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as request from 'request-promise';
import { VgApiResponse, FlatMatch, FlatPlayer } from './datatypes';

admin.initializeApp(functions.config().firebase);

const earliestMatchTimeString = moment('2017-02-14T00:00:01Z').toISOString();
const baseApiUrl = 'https://api.dc01.gamelockerapp.com';
const apiHeaders = {
        'Accept': 'application/vnd.api+json',
        'X-TITLE-ID': 'semc-vainglory',
        'Authorization': functions.config().api.key,
    };

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
                'playerNames': playerName,
                'createdAt-start': earliestMatchTimeString,
                'createdAt-end': moment(earliest).subtract(1, 'minutes').toISOString()
            }
            event.data.adminRef.root.child(`/apiQueue/${region}/${playerName}`).set(queries);
            console.log(`An api request has been set for ${playerName} : ${region} from 
                ${queries['createdAt-start']} until ${queries['createdAt-end']}`);
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
                console.warn('[PlayerQueue] delete event execution');
                return 1;
            }
            addNextApiRequest(event, region, playerName);
        });


const addPlayer = (flatPlayer: FlatPlayer, region: string, event: any)  =>
    event.data.adminRef.root.child(`/players/${region}/${flatPlayer.name}`).update({...flatPlayer});

const addMatches = (matches: FlatMatch[], playerName: string, region: string, event: any) => {
    const matchId = (match) => (new Date(match.createdAt).getTime() / 1000).toString() + match.id;
    let matchMetas = {};
    let matchDict = {};
    matches.forEach(match => {
        const match_id = matchId(match);
        matchMetas[match_id] = match.createdAt;
        matchDict[match_id] = match;
    });
    return event.data.adminRef.root.child(`/matches/${region}`).update({...matchDict}).then(
        event.data.adminRef.root.child(`/players/${region}/${playerName}/matches`).update({...matchMetas})
    );
};

// Executable Firebase Function
export const matchRequestConsumer =
    functions.database.ref('/apiQueue/{region}/{playerName}')
        .onWrite(event => {
            const region = event.params.region;
            const playerName = event.params.playerName;
            const query = event.data.val();
            if (query === null) {
                console.warn('[ApiQueue] delete event execution');
                return 1;
            }
            console.log(`[ApiConsumer] ${playerName} ${region} ${JSON.stringify(query, null, 2)}`);
            const options = {
                uri: `${baseApiUrl}/shards/${region}/matches`,
                qs: {
                    'filter[playerNames]': query['playerNames'],
                    'filter[createdAt-end]': query['createdAt-end'],
                    'filter[createdAt-start]': query['createdAt-start'],
                    sort: '-createdAt'
                },
                headers: apiHeaders,
                json: true
            };
            request(options)
                .then((matches) => {
                    console.log(`[ApiRequest] returned ${matches.data.length} matches for ${playerName} : ${region}`);
                    let orderedFlatMatches = [];
                    matches.data.forEach((match, index) => orderedFlatMatches.push(new FlatMatch(matches, index)));
                    orderedFlatMatches = orderedFlatMatches.sort(
                        (a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
                    );
                    addMatches(orderedFlatMatches, playerName, region, event).then(
                        event.data.adminRef.root.child(`playerQueue/${region}/${playerName}`).set({ requestedAt: new Date().toISOString() })
                    );
                })
                .catch(function (err) {
                    console.error(err);
                });
                event.data.ref.set(null);
        });


