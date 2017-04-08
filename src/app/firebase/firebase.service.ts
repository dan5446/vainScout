import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService, queries } from '../api/api.service';
import { FlatPlayer, FlatMatch, FlatRoster, Match } from '../api/datatypes';
import { FirebasePlayer, FirebaseMatch, FirebaseRoster } from './datatypes';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/combineAll';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/pluck';

const baseUrl = 'https://vainscout.firebaseio.com/region/';

@Injectable()
export class FirebaseService {

    constructor(private af: AngularFire) { }

    fetchPlayer(playerName: string, region: string) {
        const playerMapString = '/region/' + region + '/playerMeta/' + playerName;
        return this.af.database.object(playerMapString)
            .switchMap(meta =>
                meta.playerID ?
                this.fetchPlayerById(meta.playerID, region) :
                Observable.of({term: playerName, region: region}));
    }

    fetchPlayerById(playerId: string, region: string) {
        const playerPathString = (id: string) => '/region/' + region + '/players/' + id;
        return this.af.database.object(playerPathString(playerId));
    }

    fetchPlayerMatches(playerName: string, region: string): Observable<any> {
        const matchString = baseUrl + region + '/matches/';
        return this.af.database.object('/region/' + region + '/playerMeta/' + playerName + '/matches')
            .map(data => Object.keys(data))
            .concatMap(ids => {
                const observables = ids.filter(i => i !== '$value')
                    .map(id => this.af.database.object(matchString + id));
                return Observable.of(observables);
            });
    }

    addPlayer(flatPlayer: FlatPlayer) {
        this.af.database.object('/region/' + flatPlayer.shardId + '/players/' + flatPlayer.id).update(flatPlayer);
        this.af.database.object('/region/' + flatPlayer.shardId + '/playerMeta/' + flatPlayer.name).update({ playerID: flatPlayer.id });
        return this.af.database.object('/region/' + flatPlayer.shardId + '/players/' + flatPlayer.id);
    }

    addMatches(matches: FlatMatch[], playerName: string) {
        const playerMetaAdd = (player) => this.af.database.object('/region/na/playerMeta/' + player.name)
            .update({ playerID: player.id });
        const matchMetaAdd = (name, match: FlatMatch) => this.af.database.list('/region/na/playerMeta/' + name + '/matches/')
            .push({ 'id': match.id, 'createdAt': match.createdAt, });
        const matchPromises = matches.map(match => this.af.database.object('/region/na/matches/' + match.id).set(match))
            .concat(
                matches.map(match => this.af.database.object('/region/na/playerMeta/' + playerName + '/matches/' + match.id).set(match.id))
            )
            .concat(
                matches.map(m => m.players.map(p => playerMetaAdd(p))).reduce((item, rest) => item.concat(rest))
            )
            .concat(
                matches.map(match => match.players.map(p => matchMetaAdd(p.name, match))).reduce((item, rest) => item.concat(rest))
            );
        return Observable.forkJoin(matchPromises);
    }

    markPlayerRequest(player: any) {
        this.af.database.object('/requestQueue/' + player.id)
            .set({ name: player.name, region: (player.shardId || 'na'), requestedAt: new Date().toISOString() });
    }

}
