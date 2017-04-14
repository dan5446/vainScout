import { Injectable } from '@angular/core';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/do';

import { FlatPlayer, FlatMatch } from '../models';

@Injectable()
export class FirebaseService {

    constructor(private af: AngularFire) { }

    fetchPlayer(playerName: string, region: string) {
        const playerMapString = `/players/${region}/${playerName}`;
        return this.af.database.object(playerMapString);
    }

    fetchMatches(playerName: string, region: string, page = 0, limit = 10): Observable<any> {
        const matchString = 'https://vainscout.firebaseio.com/matches/' + region + '/';
        return this.af.database.object(`/players/${region}/${playerName}/matches`)
            .map(data => Object.keys(data).reverse().slice(page * limit, page * limit + limit))
            .concatMap(ids => {
                const observables = ids.reverse().filter(i => i !== '$value')
                    .map(id => this.af.database.object(matchString + id));
                return Observable.of(observables.reverse()).debounceTime(75);
            });
    }

    fetchMatchCount(playerName: string, region: string) {
        return this.af.database.list(`/players/${region}/${playerName}/matches`)
            .debounceTime(50)
            .map(list => list.length);
    }

    addPlayer(flatPlayer: FlatPlayer, region: string) {
        return this.af.database.object(`/players/${region}/${flatPlayer.name}`).update({...flatPlayer});
    }

    addMatches(matches: FlatMatch[], playerName: string, region: string): Observable<any> {
        if (region === undefined || region === '') { region = 'na'; }
        const matchId = (match) => (new Date(match.createdAt).getTime() / 1000).toString() + match.id;
        const matchMetaAdd = (name, match: FlatMatch) => {
            const orderedMatchId = new Date(match.createdAt).getTime().toString() + region + playerName;
            return this.af.database.object(`/players/${region}/${name}/matches/${matchId(match)}`).set(match.createdAt);
        }
        const matchPromises = matches.map(match => this.af.database.object(`/matches/${region}/${matchId(match)}`).set(match))
            .concat(matches.map(match => matchMetaAdd(playerName, match)));
        return Observable.forkJoin(matchPromises);
    }

    markPlayerRequest(playerName: string, region: string) {
        this.af.database.object(`/playerQueue/${region}/${playerName}`)
            .set({ requestedAt: new Date().toISOString() });
    }

}
