import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ApiService, queries } from './api.service';
import { Player } from './datatypes';

@Injectable()
export class ApiStoreService {

    private _player: BehaviorSubject<string> = new BehaviorSubject(null);
    private _playerStats: BehaviorSubject<Player> = new BehaviorSubject(null);
    private _commonHeroes: BehaviorSubject<any> = new BehaviorSubject(null);
    private _region: BehaviorSubject<string> = new BehaviorSubject(null);

    constructor(private api: ApiService) { }

    get player(): any {
        return this._player.asObservable();
    }

    set player(player: any) {
        this._player.next(player);
        // this.loadPlayerData();
    }

    get playerStats() {
        return this._playerStats.asObservable();
    }

    get commonHeroes() {
        // this.fetchCommonHeroes();
        return this._commonHeroes.asObservable();
    }

    get region(): any {
        return this._region.asObservable();
    }

    set region(region: any) {
        this._region.next(region);
    }

    // fetchCommonHeroes() {
    //     this.api.getMatches(null, queries.players(this._player.value))
    //         .subscribe(
    //             res => {
    //                 this._commonHeroes.next(res);
    //             }
    //         );
    // }

    // loadPlayerData() {
    //     this.api.getPlayerByName(this._player.value).subscribe(
    //         res => {
    //             this._playerStats.next(res);
    //         }
    //     );
    // }
}
