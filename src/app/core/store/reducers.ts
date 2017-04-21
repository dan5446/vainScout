import { FirebasePlayer, FlatPlayer, FlatMatch } from '../models';
import * as PlayerActions from './actions';
import { Observable } from 'rxjs/Observable';


export interface State {
    playerName: string;
    region: string;
    player: Observable<FlatPlayer>;
    matches: Observable<FlatMatch>[];
    matchCount: Observable<number>;
    page: number;
    pageSize: number;
    playerNotFound: boolean;
    loading: boolean;
    paging: boolean;
}

const initialState: State = {
    playerName: '',
    region: 'na',
    player: null,
    matches: null,
    matchCount: null,
    page: 0,
    pageSize: 10,
    playerNotFound: null,
    loading: false,
    paging: false,
};

export function reducer(state = initialState, action: PlayerActions.Actions): State {
    switch (action.type) {

        case PlayerActions.ActionTypes.SEARCH_PLAYER: {
            const query = <{region: string, name: string}>action.payload;
            return {
                ...state,
                playerName: query.name,
                region: query.region,
                loading: true,
            };
        }

        case PlayerActions.ActionTypes.SEARCH_PLAYER_SUCCESS: {
            return {
                ...state,
                playerNotFound: false,
                page: 0
            };
        }

        case PlayerActions.ActionTypes.SEARCH_PLAYER_FAIL: {
            return {
                ...state,
                playerNotFound: true,
                loading: false
            };
        }

        case PlayerActions.ActionTypes.UPDATE_MATCHES_DONE: {
            const matches$ = <Observable<FlatMatch>[]>action.payload;
            return {
                ...state,
                matches: matches$,
                paging: false
            };
        }

        case PlayerActions.ActionTypes.UPDATE_MATCH_COUNT_DONE: {
            const count$ = <Observable<number>>action.payload;
            return {
                ...state,
                matchCount: count$
            };
        }

        case PlayerActions.ActionTypes.UPDATE_PLAYER_DONE: {
            const player$ = <Observable<FlatPlayer>>action.payload;
            return {
                ...state,
                player: player$
            };
        }

        case PlayerActions.ActionTypes.UPDATE_FIREBASE_OBSERVABLES_DONE: {
            console.log(action.payload);
            return {
                ...state,
                loading: false
            };
        }

        case PlayerActions.ActionTypes.GO_TO_MATCH_PAGE: {
            const page = <number>action.payload;
            return {
                ...state,
                page: page
            };
        }

        default: {
            return state;
        }
    }
}

export const selectPlayer = (state: State) => state.player;
export const selectPlayerNotFound = (state: State) => state.playerNotFound;
export const selectMatches = (state: State) => state.matches;
export const selectMatchCount = (state: State) => state.matchCount;
export const selectRegion = (state: State) => state.region;
export const selectPlayerName = (state: State) => state.playerName;
export const selectMatchPage = (state: State) => state.page;
export const selectPageSize = (state: State) => state.pageSize;




