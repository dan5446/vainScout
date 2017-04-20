import { Action } from '@ngrx/store';
import { FirebasePlayer, FlatPlayer, FlatMatch, VgApiResponse } from '../models';
import { type } from '../util';
import { Observable } from 'rxjs/observable';

export const ActionTypes = {
    SEARCH_PLAYER: type('[VainScout] Search For Player'),
    SEARCH_PLAYER_SUCCESS: type('[VainScout] Search For Player Success'),
    SEARCH_PLAYER_FAIL: type('[VainScout] Search For Player Failed'),
    LOOKUP_PLAYER_DB: type('[Player] Lookup in Firebase'),
    LOOKUP_PLAYER_DB_SUCCESS: type('[Player] Lookup in Firebase Success'),
    LOOKUP_PLAYER_DB_FAIL: type('[Player] Lookup in Firebase Fail'),
    SEARCH_PLAYER_API: type('[Player] Search Api'),
    SEARCH_PLAYER_API_SUCCESS: type('[Player] Search Api Success'),
    SEARCH_PLAYER_API_FAIL: type('[Player] Search Api Failure'),
    SEARCH_MATCHES_API: type('[Matches] Search Api'),
    SEARCH_MATCHES_API_SUCCESS: type('[Matches] Search Api Success'),
    SEARCH_MATCHES_API_FAIL: type('[Matches] Search Api Fail'),
    HYDRATE_MATCHES: type('[VainScout] Hydrate Matches from Api'),
    HYDRATE_MATCHES_DONE: type('[VainScout] Hydrate Matches from Api Done'),
    SEND_TO_REQUEST_QUEUE: type('[VainScout] Add Player to Api Request Queue'),
    SEND_TO_REQUEST_QUEUE_DONE: type('[VainScout] Add Player to Api Request Queue Done'),
    UPDATE_PLAYER: type('[Player] Update Player from Firebase'),
    UPDATE_PLAYER_DONE: type('[Player] Update Player from Firebase Done'),
    UPDATE_FIREBASE_OBSERVABLES: type('[VainScout] Updating The UI From Firebase'),
    UPDATE_FIREBASE_OBSERVABLES_DONE: type('[VainScout] Updating The UI From Firebase Done'),
    UPDATE_MATCHES: type('[Matches] Update Matches from Firebase'),
    UPDATE_MATCHES_DONE: type('[Matches] Update Matches from Firebase Done'),
    UPDATE_MATCH_COUNT: type('[Matches] Update Match Count from Firebase'),
    UPDATE_MATCH_COUNT_DONE: type('[Matches] Update Match Count from Firebase Done'),
    GO_TO_MATCH_PAGE: type('[Matches] Go to matches page'),
};

export class SearchPlayer implements Action {
    readonly type = ActionTypes.SEARCH_PLAYER;
    constructor(public payload: { region: string, name: string }) { }
}

export class SearchPlayerSuccess implements Action {
    readonly type = ActionTypes.SEARCH_PLAYER_SUCCESS;
    constructor(public payload: true) { }
}

export class SearchPlayerFail implements Action {
    readonly type = ActionTypes.SEARCH_PLAYER_FAIL;
    constructor(public payload: false) { }
}

export class LookupPlayerInFirebase implements Action {
    readonly type = ActionTypes.LOOKUP_PLAYER_DB;
    constructor(public payload: { region: string, name: string }) { }
}

export class LookupPlayerInFirebaseSuccess implements Action {
    readonly type = ActionTypes.LOOKUP_PLAYER_DB_SUCCESS;
    constructor(public payload: FlatPlayer) { }
}

export class LookupPlayerInFirebaseFail implements Action {
    readonly type = ActionTypes.LOOKUP_PLAYER_DB_FAIL;
    constructor(public payload: { region: string, name: string }) { }
}

export class LookupPlayerInApi implements Action {
    readonly type = ActionTypes.SEARCH_PLAYER_API;
    constructor(public payload: { region: string, name: string }) { }
}

export class LookupPlayerInApiSuccess implements Action {
    readonly type = ActionTypes.SEARCH_PLAYER_API_SUCCESS;
    constructor(public payload: FlatPlayer) { }
}

export class LookupPlayerInApiFail implements Action {
    readonly type = ActionTypes.SEARCH_PLAYER_API_FAIL;
    constructor(public payload: false) { }
}

export class LookupMatchesInApi implements Action {
    readonly type = ActionTypes.SEARCH_MATCHES_API;
    constructor(public payload: { region: string, name: string }) { }
}

export class LookupMatchesInApiSuccess implements Action {
    readonly type = ActionTypes.SEARCH_MATCHES_API_SUCCESS;
    constructor(public payload: { response: VgApiResponse, player: FlatPlayer }) { }
}

export class LookupMatchesInApiFail implements Action {
    readonly type = ActionTypes.SEARCH_MATCHES_API_FAIL;
    constructor(public payload: false) { }
}

export class HydrateMatches implements Action {
    readonly type = ActionTypes.HYDRATE_MATCHES;
    constructor(public payload: { region: string, name: string }) { }
}

export class HydrateMatchesDone implements Action {
    readonly type = ActionTypes.HYDRATE_MATCHES_DONE;
    constructor(public payload: any) { }
}

export class SendToRequestQueue implements Action {
    readonly type = ActionTypes.SEND_TO_REQUEST_QUEUE;
    constructor(public payload: FlatPlayer) { }
}

export class SendToRequestQueueDone implements Action {
    readonly type = ActionTypes.SEND_TO_REQUEST_QUEUE_DONE;
    constructor(public payload: any) { }
}

export class UpdateFirebaseObservables implements Action {
    readonly type = ActionTypes.UPDATE_FIREBASE_OBSERVABLES;
    constructor(public payload: { region: string, name: string }) { }
}

export class UpdateFirebaseObservablesDone implements Action {
    readonly type = ActionTypes.UPDATE_FIREBASE_OBSERVABLES_DONE;
    constructor(public payload: true) { }
}

export class UpdatePlayer implements Action {
    readonly type = ActionTypes.UPDATE_PLAYER;
    constructor(public payload: { region: string, name: string }) { }
}

export class UpdatePlayerDone implements Action {
    readonly type = ActionTypes.UPDATE_PLAYER_DONE;
    constructor(public payload: Observable<FlatPlayer>) { }
}

export class UpdateMatches implements Action {
    readonly type = ActionTypes.UPDATE_MATCHES;
    constructor(public payload: {name: string, region: string, page: number, limit: number}) { }
}

export class UpdateMatchesDone implements Action {
    readonly type = ActionTypes.UPDATE_MATCHES_DONE;
    constructor(public payload: Observable<FlatMatch>[]) { }
}

export class UpdateMatchCount implements Action {
    readonly type = ActionTypes.UPDATE_MATCH_COUNT;
    constructor(public payload: {name: string, region: string, page: number, limit: number}) { }
}

export class UpdateMatchCountDone implements Action {
    readonly type = ActionTypes.UPDATE_MATCH_COUNT_DONE;
    constructor(public payload: Observable<number>) { }
}

export class SearchLatestMatches implements Action {
    readonly type = ActionTypes.SEARCH_MATCHES_API;
    constructor(public payload: {player: FlatPlayer, latest: string}) { }
}

export class GoToMatchPage implements Action {
    readonly type = ActionTypes.GO_TO_MATCH_PAGE;
    constructor(public payload: number) { }
}

export type Actions
    =
    | SearchPlayer
    | SearchPlayerSuccess
    | SearchPlayerFail
    | LookupPlayerInFirebase
    | LookupPlayerInFirebaseSuccess
    | LookupPlayerInFirebaseFail
    | LookupPlayerInApi
    | LookupPlayerInApiSuccess
    | LookupPlayerInApiFail
    | LookupMatchesInApi
    | LookupMatchesInApiSuccess
    | LookupMatchesInApiFail
    | HydrateMatches
    | HydrateMatchesDone
    | SendToRequestQueue
    | SendToRequestQueueDone
    | UpdateFirebaseObservables
    | UpdateFirebaseObservablesDone
    | UpdatePlayer
    | UpdatePlayerDone
    | UpdateMatches
    | UpdateMatchesDone
    | UpdateMatchCount
    | UpdateMatchCountDone
    | GoToMatchPage;
