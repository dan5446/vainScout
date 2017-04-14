import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/Observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/distinctUntilChanged';

import * as fromRoot from './reducers';
import { FirebaseService, ApiService } from '../services';
import { FirebasePlayer, FlatPlayer, FlatMatch } from '../models';
import * as PlayerActions from './actions';

@Injectable()
export class PlayerEffects {

    @Effect() // User enters playerName & region - we call the vgApi to see if there is a record of the player
    doesPlayerExist$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.SEARCH)
        .map(toPayload).filter(payload => payload.name !== '')
        .distinctUntilChanged((left, right) => left.name === right.name && left.region === right.region)
        .switchMap(params => this.apiService.getPlayer(params.name, params.region))
        .map((player: FlatPlayer) => player === null ? new PlayerActions.SearchFail(player) : new PlayerActions.SearchSuccess(player));

    @Effect() // We have a good player - we mark a player request and then lookup the matches
    markPlayerRequest$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.SEARCH_SUCCESS)
        .map(toPayload).do(player => this.firebaseService.addPlayer(player, player.shardId))
        .map(player => new PlayerActions.SearchMatches(player));

    @Effect()
    fetchLatestMatches$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.SEARCH_MATCHES)
        .map(toPayload)
        .do(player => this.apiService.getLatestMatches((player.shardId || 'na'), player.name)
            .subscribe(response => {
                const matches = response.data.map((match, index) => new FlatMatch(response, index));
                this.firebaseService.addMatches(matches, player.name, (player.shardId || 'na'))
                .subscribe(data => this.firebaseService.markPlayerRequest(player.name, player.shardId));
            })
        ).map(player => new PlayerActions.UpdateUi(player));

    constructor(
        private actions$: Actions,
        private firebaseService: FirebaseService,
        private apiService: ApiService,
        private state$: Store<fromRoot.State>
    ) { }
}
