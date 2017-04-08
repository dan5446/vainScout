import { Action } from '@ngrx/store';
import { FirebasePlayer } from '../firebase/datatypes';
import { FlatPlayer } from '../api/datatypes';

export const SEARCH = '[FirebasePlayer] Search';
export const SEARCH_SUCCESS = '[FirebasePlayer] Search Success';
export const SEARCH_FAIL = '[FirebasePlayer] Search Failure';

export const LOOKUP = '[VgApiPlayer] Lookup';
export const LOOKUP_SUCCESS = '[VgApiPlayer] Lookup Success';
export const LOOKUP_FAIL = '[VgApiPlayer] Lookup Fail';

export const UPDATE_FIREBASE_PLAYER = '[FirebasePlayer] Update Firebase Player';
export const UPDATE_FIREBASE_PLAYER_DONE = '[FirebasePlayer] Update Firebase Player Done';


export class Search implements Action {
    readonly type = SEARCH;
    constructor(public payload: { region: string, name: string }) { }
}

export class SearchSuccess implements Action {
    readonly type = SEARCH_SUCCESS;
    constructor(public payload: FirebasePlayer) { }
}

export class SearchFail implements Action {
    readonly type = SEARCH_FAIL;
    constructor(public payload: string) { }
}

export class Lookup implements Action {
    readonly type = LOOKUP;
    constructor(public payload: { region: string, term: string }) { }
}

export class LookupSuccess implements Action {
    readonly type = LOOKUP_SUCCESS;
    constructor(public payload: FlatPlayer) { }
}

export class LookupFail implements Action {
    readonly type = LOOKUP_FAIL;
    constructor(public payload: FlatPlayer) { }
}

export class UpdateFirebasePlayer implements Action {
    readonly type = UPDATE_FIREBASE_PLAYER;
    constructor(public payload: FlatPlayer) { }
}

export class UpdateFirebasePlayerDone implements Action {
    readonly type = UPDATE_FIREBASE_PLAYER_DONE;
    constructor(public payload: FirebasePlayer) { }
}

export type All = Search | SearchSuccess | SearchFail | Lookup | LookupSuccess |
    LookupFail | UpdateFirebasePlayer | UpdateFirebasePlayerDone;
