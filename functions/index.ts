import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp(functions.config().firebase);

const requestMatches = (ref) => {
    // ref.root('matchRequest').pust
    console.log('requesting match calls here');
}

export const processPlayerQueue =
    functions.database.ref('/requestQueue/{playerId}')
        .onWrite(event => {
            const requestedId = event.params.playerId;
            const requested = event.data.val();
            console.log('requestedId: ', requestedId, '\r\n,', 'requestBody: ', requested);
            if (requested === null) {
                console.log('Cleaning up');
                return 1;
            }
            const metaPath = '/region/' + requested.region + '/playerMeta/' + requested.name;
            const latestMatchPath = metaPath + '/latestMatch';
            event.data.adminRef.root.child(latestMatchPath).once('value')
                .then((data: admin.database.DataSnapshot) => {
                    let latest = data.val();
                    if (latest === null) {
                        latest = '02-14-2017T00:00:00:001Z';
                        event.data.adminRef.root.child(metaPath + '/latestMatch').set('02-02-2017T00:00:00:001Z');
                    } else {
                        event.data.adminRef.root.child(metaPath + '/latestMatch').set('02-02-2017T00:00:00:001Z');
                    }
                    event.data.adminRef.root.child('apiQueue').push({region: requested.region, name: requested.name, from: latest});
                    console.log('Latest Match', latest);
                    console.log({region: requested.region, name: requested.name, from: latest});
                    event.data.ref.set(null);
                });
    });