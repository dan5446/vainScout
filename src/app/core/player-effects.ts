import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { Injectable } from '@angular/core';
import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/Observable/of';
import { Action } from '@ngrx/store';

import { FirebaseService } from '../firebase/firebase.service';
import { FirebasePlayer } from '../firebase/datatypes';
import { ApiService } from '../api/api.service';
import * as PlayerActions from './player-actions';
import * as MatchesActions from './matches-actions';

@Injectable()
export class PlayerEffects {

    @Effect()
    searchFirebasePlayer$: Observable<Action> = this.actions$.ofType(PlayerActions.SEARCH)
        .map((action: PlayerActions.Search) => action.payload)
        .switchMap(params => this.firebaseService.fetchPlayer(params.name, params.region))
        .map((result: any) => result.id ? new PlayerActions.SearchSuccess(result) : new PlayerActions.SearchFail(result));

    @Effect()
    searchPlayerSuccess$: Observable<Action> = this.actions$.ofType(PlayerActions.SEARCH_SUCCESS)
        .map((action: MatchesActions.Search) => action.payload)
        .do(p => console.log(p))
        .do(params => this.firebaseService.markPlayerRequest(params))
        .map(params => new MatchesActions.Search(params));

    @Effect()
    searchFirebaseMatches$: Observable<Action> = this.actions$.ofType(MatchesActions.SEARCH)
        .map((action: MatchesActions.Search) => action.payload)
        .do(data => console.log(data))
        .switchMap(params => {console.log(params); return this.firebaseService.fetchPlayerMatches(params.name, (params.shardId || 'na'));})
        .do(data => console.log(data))
        .map((results: any) => new MatchesActions.SearchDone(results));

    // @Effect()
    // searchMatchesFail$: Observable<Action> = this.actions$.ofType(MatchesActions.SEARCH_FAIL)
    //     .map(data => console.log(data))

    @Effect()
    searchApi$: Observable<Action> = this.actions$.ofType(PlayerActions.SEARCH_FAIL)
        .map((action: PlayerActions.Lookup) => action.payload)
        .switchMap(params => this.apiService.getPlayerByName(params.term, params.region))
        .do(data => console.log(data))
        .map(result => result === null ? new PlayerActions.LookupFail(null) : new PlayerActions.LookupSuccess(result));

    @Effect()
    apiToFirebase$: Observable<Action> = this.actions$.ofType(PlayerActions.LOOKUP_SUCCESS)
        .map((action: PlayerActions.UpdateFirebasePlayer) => action.payload)
        .do(params => this.firebaseService.markPlayerRequest(params))
        .switchMap(param => this.firebaseService.addPlayer(param))
        .do(data => console.log(data))
        .map(result => new PlayerActions.UpdateFirebasePlayerDone({...result}));

    // @Effect()
    // matchTrigger$: Observable<Action> = this.actions$.ofType(PlayerActions.UPDATE_FIREBASE_PLAYER_DONE)
    //     .map((action: MatchesActions.Search) => action.payload)
    //     .do(data => console.log(data))
    //     .switchMap(params => this.firebaseService.fetchPlayerMatches(params.playerId, params.region))
    //     .do(data => console.log(data))
    //     .map(results => new MatchesActions.SearchSuccess(results));

    constructor(
        private actions$: Actions,
        private firebaseService: FirebaseService,
        private apiService: ApiService,
        // private store: Store<fromRoot.State>
    ) { }
}
