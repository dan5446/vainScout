import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ApiService, queries } from '../api/api.service';
import { FlatPlayer, FlatMatch, FlatRoster, Match } from '../api/datatypes';
import { FirebasePlayer, FirebaseMatch, FirebaseRoster } from './datatypes';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';

import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergeAll';
import 'rxjs/add/operator/combineAll';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/take';

const playerString = 'https://vainscout.firebaseio.com/region/na/players/';
const matchString = 'https://vainscout.firebaseio.com/region/na/matches/';

@Injectable()
export class FirebaseService {

    private _player: BehaviorSubject<string> = new BehaviorSubject(null);
    private _playerName: BehaviorSubject<string> = new BehaviorSubject(null);
    private _playerStats: BehaviorSubject<FirebasePlayer> = new BehaviorSubject(null);
    private _matches: BehaviorSubject<FlatMatch> = new BehaviorSubject(null);
    private _playerMatches: BehaviorSubject<Array<FirebaseMatch>> = new BehaviorSubject(null);
    private _commonHeroes: BehaviorSubject<any> = new BehaviorSubject(null);
    private _region: BehaviorSubject<string> = new BehaviorSubject(null);

    constructor(private af: AngularFire) { }

    get player(): any {
        return this._player.asObservable();
    }

    set player(player: any) {
        this._player.next(player);
    }

    get playerStats() {
        return this._playerStats.asObservable();
    }

    get region(): any {
        return this._region.asObservable();
    }

    set region(region: any) {
        this._region.next(region);
    }

    fetchPlayer(playerName: string, region: string) {
        const playerInDb = this.af.database.object('/region/na/playerMeta/' + playerName).take(1);
        const notFoundError = Observable.throw('Player: ' + playerName + ' was not found in database');
        const playerIdCallback = (id) => this.af.database.object(playerString + id).take(1).map(data => new FirebasePlayer(data));

        return playerInDb
            .catch(error => notFoundError)
            .map(data => data.playerID)
            .mergeMap(id => id ? playerIdCallback(id) : Observable.throw('Player: ' + playerName + ' was not found in database'));
    }

    fetchPlayerMatches(playerName: string, region: string): Observable<FirebaseMatch[]> {
        const matchesInDb = this.af.database.object('/region/na/playerMeta/' + playerName + '/matches').take(1);
        const notFoundError = Observable.throw('No matches for player: ' + playerName + ' were found in database');
        const playerMatchCallback = (id) => this.af.database.object(matchString + id).take(1).map(data => new FirebaseMatch(data));

        return matchesInDb
            .catch(error => notFoundError)
            .map(data => Object.keys(data))
            .mergeMap(ids => ids.filter(i => i !== '$value').map(id => playerMatchCallback(id)))
            .combineAll();
    }

    addPlayer(flatPlayer: FlatPlayer) {
        return Observable.forkJoin(
            this.af.database.object('/region/na/players/' + flatPlayer.id).update(flatPlayer),
            this.af.database.object('/region/na/playerMeta/' + flatPlayer.name).update({ playerID: flatPlayer.id })
        );
    }

    addMatches(matches: FlatMatch[], playerName: string) {
        const playerMetaAdd = (player) => this.af.database.object('/region/na/playerMeta/' + player.name).update({ playerID: player.id });
        const matchMetaAdd = (name, mId) => this.af.database.object('/region/na/playerMeta/' + name + '/matches/' + mId).set(mId);
        const matchPromises = matches.map(match => this.af.database.object('/region/na/matches/' + match.id).set(match))
            .concat(
                matches.map(match => this.af.database.object('/region/na/playerMeta/' + playerName + '/matches/' + match.id).set(match.id))
            )
            .concat(
                matches.map(m => m.players.map(p => playerMetaAdd(p))).reduce((item, rest) => item.concat(rest))
            )
            .concat(
                matches.map(match => match.players.map(p => matchMetaAdd(p.name, match.id))).reduce((item, rest) => item.concat(rest))
            );
        return Observable.forkJoin(matchPromises);
    }


}
