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
import * as SearchActions from './player-actions';

@Injectable()
export class PlayerEffects {

  @Effect()
  searchFirebase$: Observable<Action> = this.actions$.ofType(SearchActions.SEARCH)
    .map((action: SearchActions.Search) => action.payload)
    .do(data => console.log(data))
    .switchMap(params => this.firebaseService.fetchPlayer(params.name, params.region))
    .map((result: any)  => result.id ? new SearchActions.SearchSuccess(result) : new SearchActions.SearchFail(result));


  @Effect()
  searchApi$: Observable<Action> = this.actions$.ofType(SearchActions.SEARCH_FAIL)
    .map((action: SearchActions.Lookup) => action.payload)
    .switchMap(params => this.apiService.getPlayerByName(params.term, params.region))
    .do(data => console.log(data))
    .map(result => result === null ? new SearchActions.LookupFail(null) : new SearchActions.LookupSuccess(result));


  @Effect()
  apiToFirebase$: Observable<Action> = this.actions$.ofType(SearchActions.LOOKUP_SUCCESS)
    .map((action: SearchActions.UpdateFirebasePlayer) => action.payload)
    .switchMap(param => this.firebaseService.addPlayer(param))
    .do(data => console.log(data))
    .map(result => new SearchActions.UpdateFirebasePlayerDone(null));

  constructor(
    private actions$: Actions,
    private firebaseService: FirebaseService,
    private apiService: ApiService,
    // private store: Store<fromRoot.State>
  ) {}
}
