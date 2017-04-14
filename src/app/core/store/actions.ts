import { Action } from '@ngrx/store';
import { FirebasePlayer, FlatPlayer } from '../models';
import { type } from '../util';


export const ActionTypes = {
    SEARCH: type('[Player] Search'),
    SEARCH_SUCCESS: type('[Player] Search Success'),
    SEARCH_FAIL: type('[Player] Search Failure'),
    SEARCH_MATCHES: type('[ApiMatches] Search Matches'),
    SEARCH_MATCHES_DONE: type('[ApiMatches] Search Matches Done'),
    UPDATE_UI: type('[FirebaseMatches] Update Ui from Firebase'),
    UPDATE_UI_DONE: type('[FirebaseMatches] Update Ui from Firebase Done'),
    INCREMENT_MATCH_PAGE: type('[FirebaseMatches] Increment matches page'),
    DECREMENT_MATCH_PAGE: type('[FirebaseMatches] Decrement matches page'),
};


export class Search implements Action {
    readonly type = ActionTypes.SEARCH;
    constructor(public payload: { region: string, name: string }) { }
}

export class SearchSuccess implements Action {
    readonly type = ActionTypes.SEARCH_SUCCESS;
    constructor(public payload: FlatPlayer) { }
}

export class SearchFail implements Action {
    readonly type = ActionTypes.SEARCH_FAIL;
    constructor(public payload: FlatPlayer) { }
}

export class SearchMatches implements Action {
    readonly type = ActionTypes.SEARCH_MATCHES;
    constructor(public payload: FlatPlayer) { }
}

export class SearchMatchesDone implements Action {
    readonly type = ActionTypes.SEARCH_MATCHES_DONE;
    constructor(public payload: FlatPlayer) { }
}

export class UpdateUi implements Action {
    readonly type = ActionTypes.UPDATE_UI;
    constructor(public payload: FlatPlayer) { }
}

export class UpdateUiDone implements Action {
    readonly type = ActionTypes.UPDATE_UI_DONE;
    constructor(public payload: { player$: any, matches$: any }) { }
}

export class IncrementMatchPage implements Action {
    readonly type = ActionTypes.INCREMENT_MATCH_PAGE;
    constructor(public payload: null) { }
}

export class DecrementMatchPage implements Action {
    readonly type = ActionTypes.DECREMENT_MATCH_PAGE;
    constructor(public payload: null) { }
}

export type Actions
    = Search
    | SearchSuccess
    | SearchFail
    | SearchMatches
    | SearchMatchesDone
    | UpdateUi
    | UpdateUiDone
    | IncrementMatchPage
    | DecrementMatchPage;
