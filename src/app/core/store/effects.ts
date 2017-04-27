import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/distinctUntilChanged';

import * as fromRoot from './reducers';
import { FirebaseService, ApiService } from '../services';
import { FirebasePlayer, FlatPlayer, FlatMatch } from '../models';
import * as PlayerActions from './actions';

@Injectable()
export class PlayerEffects {

    @Effect() // User enters playerName & region - we call the debounce & dispatch the db lookup action
    searchPlayer$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.SEARCH_PLAYER)
    .do(data => console.log('SEARCH PLAYER'))
        .map(toPayload).filter(params => params.name !== '')
        .distinctUntilChanged((left, right) => left.name === right.name && left.region === right.region)
        .map(params => new PlayerActions.LookupPlayerInFirebase(params));

    @Effect() // With playerName & region - we call the db to see if there is a record of the player & dispatch
    isPlayerInDb$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.LOOKUP_PLAYER_DB)
    .do(data => console.log('lookup in fb'))
        .map(toPayload)
        .switchMap(params =>
            this.firebaseService.fetchPlayer(params.name, params.region).take(1)
            .catch((err, caught) => Observable.of(new PlayerActions.LookupPlayerInFirebaseFail(params)))
            .map(player => player['matches'] ?
                new PlayerActions.LookupPlayerInFirebaseSuccess(player) :
                new PlayerActions.LookupPlayerInFirebaseFail(params))
        );

    @Effect() // Player was found in the db with matches so dispatch a bunch of actions
    playerInDb$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.LOOKUP_PLAYER_DB_SUCCESS)
        .do(data => console.log('plyer found in fb'))
        .map(toPayload)
        .mergeMap(player =>
            Observable.from([
                new PlayerActions.SearchPlayerSuccess(true),
                new PlayerActions.HydrateMatches(player),
                new PlayerActions.UpdateFirebaseObservables(player),
            ]));

    @Effect() // Player wasn't found in the db so dispatch the search action
    playerNotInDb$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.LOOKUP_PLAYER_DB_FAIL)
        .do(data => console.log('plyer not in db'))
        .map(toPayload)
        .do(data => console.log(`data for ${data} not found`))
        .map(params => new PlayerActions.LookupPlayerInApi(params));

    @Effect() // User enters playerName & region - we call the vgApi to see if there is a record of the player
    lookupPlayerApi$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.SEARCH_PLAYER_API)
        .do(data => console.log('search player in api'))
        .map(toPayload)
        .switchMap(params => this.apiService.getPlayer(params.name, params.region))
        .do(data => console.log(data))
        .map(player => player ?
            new PlayerActions.LookupPlayerInApiSuccess(player) :
            new PlayerActions.SearchPlayerFail(false));

    @Effect() // We have a good player - we mark a player request and then lookup dispatch lookup success
    playerInApi$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.SEARCH_PLAYER_API_SUCCESS)
        .do(data => console.log('found plyer in api'))
        .map(toPayload)
        .map(player => new PlayerActions.LookupMatchesInApi(player))

    @Effect()
    matchesInApi$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.SEARCH_MATCHES_API)
        .do(data => console.log('matches in api?'))
        .map(toPayload)
        .switchMap(player => this.apiService.getLatestMatches(player.region, player.name)
            .map(response =>
                response.data.length ?
                    new PlayerActions.LookupMatchesInApiSuccess({player: player, response: response}) :
                    new PlayerActions.SearchPlayerFail(false)
            )
        );

    @Effect()
    updateFirebasMatches$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.SEARCH_MATCHES_API_SUCCESS)
        .do(data => console.log('found a match in api'))
        .map(toPayload)
        .switchMap(params => {
            const player = params.player;
            const matches = params.response.data.map((m, i) => new FlatMatch(params.response, i));
            return this.firebaseService.addPlayer(player, player.region)
                .map(someval => this.firebaseService.addMatches(matches, player.name, player.region))
                .concatMap(someval =>
                    Observable.from([
                        new PlayerActions.SearchPlayerSuccess(true),
                        new PlayerActions.UpdateFirebaseObservables(player),
                        new PlayerActions.SendToRequestQueue(player),
                    ]));
        });

    @Effect()
    markAnApiRequest$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.SEND_TO_REQUEST_QUEUE)
        .do(data => console.log('sending a request queue instance'))
        .map(toPayload)
        .switchMap(params =>
            this.firebaseService.fetchPlayer(params.name, params.region).take(1)
            // .catch((err, caught) => Observable.of(new PlayerActions.LookupPlayerInFirebaseFail(params)))
            .map(player => this.firebaseService.markPlayerRequest(player))
        )
        .map(someval => new PlayerActions.SendToRequestQueueDone(someval));

    @Effect()
    fetchLatestMatchesFromApi$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.HYDRATE_MATCHES)
        .do(data => console.log('getting latest matches'))
        .map(toPayload)
        .switchMap(player => this.firebaseService.markPlayerRequest(player))
        .withLatestFrom(this.state$)
        .switchMap(([response, state]) => this.apiService.getLatestMatches(state.region, state.playerName))
        .withLatestFrom(this.state$)
        .switchMap(([res, state]) =>
                this.firebaseService.addMatches(res.data.map((m, i) => new FlatMatch(res, i)), state.playerName, state.region)
        )
        .mergeMap(someval =>
            Observable.from([
                new PlayerActions.SendToRequestQueueDone(true),
                new PlayerActions.HydrateMatchesDone(true)
            ]));

    @Effect() // User enters playerName & region - we call the db to see if there is a record of the player
    syncUiToFirebase$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.UPDATE_FIREBASE_OBSERVABLES)
        .do(data => console.log('UPDATE THE UI'))
        .map(toPayload)
        // .do(params => this.firebaseService.markPlayerRequest(params))
        .concatMap(player =>
            Observable.from([
                new PlayerActions.UpdateMatches(player),
                new PlayerActions.UpdatePlayer(player),
                new PlayerActions.UpdateMatchCount(player),
            ])
        );

    @Effect() // This action will fire every time an update is made to the firebase player and on demand
    updatePlayerFromFirebase$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.UPDATE_PLAYER)
        .map(toPayload)
        .map(player => this.firebaseService.fetchPlayer(player.name, player.region))
        .map(player => new PlayerActions.UpdatePlayerDone(player));

    @Effect() // This action will fire every time an update is made to the firebase player and on demand
    updateMatchesFromFirebase$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.UPDATE_MATCHES)
        .map(toPayload)
        .switchMap(params => this.firebaseService.fetchMatches(params.name, params.region, params.page, params.limit))
        .map(matches => new PlayerActions.UpdateMatchesDone(matches));

    @Effect() // This action will fire every time an update is made to the firebase player and on demand
    updateMatchCountFromFirebase$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.UPDATE_MATCH_COUNT)
        .map(toPayload)
        .switchMap(params => this.firebaseService.fetchMatchCount(params.name, params.region))
        .concatMap(count =>
            Observable.from([
                new PlayerActions.UpdateMatchCountDone(count),
                new PlayerActions.UpdateFirebaseObservablesDone(true)
            ])
        );

    @Effect()
    pageMatches$: Observable<Action> = this.actions$.ofType(PlayerActions.ActionTypes.GO_TO_MATCH_PAGE)
        .map(toPayload)
        .withLatestFrom(this.state$)
        .map(([page, state]) =>
            new PlayerActions.UpdateMatches({name: state.playerName, region: state.region, page: page, limit: state.pageSize}),
        );

    constructor(
        private actions$: Actions,
        private firebaseService: FirebaseService,
        private apiService: ApiService,
        private state$: Store<fromRoot.State>
    ) { }
}
