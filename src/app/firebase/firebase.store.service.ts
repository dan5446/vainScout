import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ApiService, queries } from '../api/api.service';
import { FlatPlayer, FlatMatch, FlatRoster, Player, VgApiResponse, Match } from '../api/datatypes';
import { FirebaseService } from './firebase.service';
import { FirebasePlayer, FirebaseMatch, FirebaseRoster } from './datatypes';
import { AngularFire, FirebaseObjectObservable } from 'angularfire2';
import 'rxjs/add/operator/finally';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/mergeAll';

const playerString = 'https://vainscout.firebaseio.com/region/na/players/';

@Injectable()
export class FirebaseStore {

    private _playerName: BehaviorSubject<string> = new BehaviorSubject(null);
    private _region: BehaviorSubject<string> = new BehaviorSubject(null);
    private _playerNotFound: BehaviorSubject<boolean> = new BehaviorSubject(null);

    private _player: BehaviorSubject<FirebasePlayer> = new BehaviorSubject(null);
    private _matches: BehaviorSubject<Array<FirebaseMatch>> = new BehaviorSubject(null);

    private loadingPlayer = true;
    private hydrated = false;
    private loadingMatches: boolean = !this.hydrated;


    constructor(private db: FirebaseService, private api: ApiService) { }

    get playerName(): any {
        return this._playerName.asObservable();
    }

    set playerName(player: any) {
        this.hydrated = false;
        this._playerNotFound.next(false);
        this._playerName.next(player);
        this._player.next(null);
        this._matches.next([]);
    }

    get player() {
        return this._player.asObservable();
    }

    get region(): any {
        return this._region.asObservable();
    }

    set region(region: any) {
        this._region.next(region);
    }

    get playerNotFound() {
        return this._playerNotFound.asObservable();
    }

    get matches() {
        return this._matches.asObservable();
    }

    fetchPlayerData() {
        this.db.fetchPlayer(this._playerName.value, this._region.value)
            .subscribe(
                next => { this._player.next(next); this.fetchPlayerMatches(); },
                error => { console.log(error); this.playerInApi(); }, // Player not in db, try to fetch from the api
                () => console.log('completed fetching player data')
            );
    }

    fetchPlayerMatches() {
        this.db.fetchPlayerMatches(this._playerName.value, this._region.value)
            .subscribe(
                data => {
                    this._matches.next(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
                    if (!this.hydrated) { this.hydrate(); }
                },
                error => { console.log(error); this.playerInApi(); }, // Try to fetch from the api
                () => console.log('completed fetching player matches')
            );
    }

    playerInApi() {
        this.api.getPlayerByName(this._playerName.value, this._region.value)
            .catch(error => Observable.throw(error))
            .subscribe(
                res => this.initializePlayer(res.data[0]),
                error => this._playerNotFound.next(true),
                () => console.log('finished player api lookup')
            );
    }

    initializePlayer(player: Player) {
        this.hydrateMatches().subscribe(done => console.log(done));//{ this.hydrated = true; this.fetchPlayerData(); });
    }

    hydrate() {
        this.hydrateMatches()
            .filter(res => res !== null)
            .subscribe(done => {
                console.log(done);
                this.matchesToDb(done).subscribe(done => {
                                    this.hydrated = true;
                this.fetchPlayerData();});
            }
        );
    }

    hydrateMatches() {
        // return this.api.getMatches(null, queries.players(this._playerName.value))
        //     .map(res => this.matchesToDb(res));
        // return this.api.getMatchHistory(null, queries.players(this._playerName.value)).map(res => this.matchesToDb(res));
        // Observable.forkJoin(this.api.getMatchesUntil(null, queries.players(this._playerName.value), new Date())).subscribe(d => console.log(d));
        return this.api.getMatchesUntil(null, queries.players(this._playerName.value), new Date());
    }

    matchesToDb(response: VgApiResponse) {
        const matches = <Array<Match>>response.data;
        const flatMatches: FlatMatch[] = matches.map((match, index) => new FlatMatch(response, index));
        const matchObs = this.db.addMatches(flatMatches, this._playerName.value).take(1).finally(() => console.log('done adding matches'));
        const players = response.included.filter(item => item.type === 'player');
        const playerObs = players.map(item => this.db.addPlayer(new FlatPlayer(<Player>item)));
       return Observable.forkJoin(matchObs, ...playerObs);
    }

}
