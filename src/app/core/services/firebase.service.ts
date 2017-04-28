import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';

import {Injectable} from '@angular/core';
import {AngularFire, FirebaseObjectObservable} from 'angularfire2';
import {Observable} from 'rxjs/Observable';

import {FlatMatch, FlatPlayer} from '../models';

@Injectable()
export class FirebaseService {
    constructor(private af: AngularFire) {}

    fetchPlayer(playerName: string, region: string) {
        const playerMapString = `/players/${region}/${playerName}`;
        return this.af.database.object(playerMapString);
    }

    fetchMatches(playerName: string, region: string, page = 0, limit = 10): Observable<any> {
        return this.af.database.object(`/players/${region}/${playerName}/matches`)
            .map(data => Object.keys(data).reverse().slice(page * limit, page * limit + limit))
            .concatMap(ids => {
                const observables =
                    ids.reverse().filter(i => i !== '$value').map(id => this.af.database.object(`/matches/${region}/${id}`));
                return Observable.of(observables.reverse()).take(1);
            });
    }

    fetchMatchCoverage(playerName: string, region: string) {
        return this.af.database.object(`/players/${region}/${playerName}/matches`, {preserveSnapshot: true})
            .take(1)
            .map(data => data.val())
            .map(
                meta =>
                    meta ? {earliest: meta[Object.keys(meta).sort()[0]], latest: meta[Object.keys(meta).sort().slice(-1).pop()]} : meta);
    }

    fetchMatchCount(playerName: string, region: string) {
        return this.af.database.list(`/players/${region}/${playerName}/matches`).debounceTime(50).map(list => list.length);
    }

    addPlayer(flatPlayer: FlatPlayer, region: string) {
        return Observable.from(this.af.database.object(`/players/${region}/${flatPlayer.name}`).update({...flatPlayer}));
    }

    addMatches(matches: FlatMatch[], playerName: string, region: string): Observable<any> {
        if (region === undefined || region === '') {
            region = 'na';
        }
        const matchId = (match) => (new Date(match.createdAt).getTime() / 1000).toString() + match.id;
        let matchMetas = {};
        let matchDict = {};
        matches.forEach(match => {
            const match_id = matchId(match);
            matchDict[match_id] = match;
            matchMetas[match_id] = match.createdAt;
        });
        return Observable.merge(
            this.af.database.object(`/matches/${region}`).update(matchDict),
            this.af.database.object(`/players/${region}/${playerName}/matches`).update(matchMetas));
    }

    markPlayerRequest(player) {
        console.log(player);
        if (!player.matches) {
            return null;
        }
        const orderedKeys = Object.keys(player.matches).sort();
        const earliest = player.matches[orderedKeys[0]];
        const latest = player.matches[orderedKeys.slice(-1).pop()];
        console.log(`earliest: ${earliest} latest: ${latest}`);
        return Observable.from(
            this.af.database.object(`/playerQueue/${player.region}/${player.name}`).set({earliest: earliest, latest: latest}));
    }
}
