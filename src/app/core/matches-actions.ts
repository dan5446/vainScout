import { Observable } from 'rxjs/Observable';
import { Action } from '@ngrx/store';
import { FirebaseMatch , FirebasePlayer } from '../firebase/datatypes';

export const SEARCH = '[FirebaseMatches] Search';
export const SEARCH_DONE = '[FirebaseMatches] Search Done';

export class Search implements Action {
    readonly type = SEARCH;
    constructor(public payload: FirebasePlayer) { }
}

export class SearchDone implements Action {
    readonly type = SEARCH_DONE;
    constructor(public payload: Observable<FirebaseMatch>[]) { }
}

export type All = Search | SearchDone;
