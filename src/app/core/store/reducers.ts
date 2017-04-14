import { FirebasePlayer, FlatPlayer, FlatMatch } from '../models';
import * as PlayerActions from './actions';
import { Observable } from 'rxjs/Observable';


export interface State {
    playerName: string;
    region: string;
    player: FlatPlayer;
    matches: Observable<FlatMatch>[];
    page: number;
    pageSize: number;
    playerNotFound: boolean;
}

const initialState: State = {
    playerName: '',
    region: 'na',
    player: null,
    matches: null,
    page: 0,
    pageSize: 10,
    playerNotFound: false
};

export function reducer(state = initialState, action: PlayerActions.Actions): State {
    switch (action.type) {
        case PlayerActions.ActionTypes.SEARCH: {
            const query = <{region: string, name: string}>action.payload;
            return {
                ...state,
                playerName: query.name,
                region: query.region,
                playerNotFound: false,
                page: 0
            };
        }

        case PlayerActions.ActionTypes.SEARCH_SUCCESS: {
            return {
                ...state,
            };
        }

       case PlayerActions.ActionTypes.SEARCH_FAIL: {
            return {
                ...state,
                playerNotFound: true
            };
        }

        case PlayerActions.ActionTypes.SEARCH_MATCHES: {
            return {
                ...state,
            };
        }

        case PlayerActions.ActionTypes.SEARCH_MATCHES_DONE: {
            return {
                ...state,
            };
        }

        case PlayerActions.ActionTypes.UPDATE_UI: {
            return {
                ...state,
            };
        }

        case PlayerActions.ActionTypes.UPDATE_UI_DONE: {
            const payload = <{player$: any, matches$: any}>action.payload;
            return {
                ...state,
                player: payload.player$,
                matches: payload.matches$
            };
        }

        case PlayerActions.ActionTypes.INCREMENT_MATCH_PAGE: {
            return {
                ...state,
                page: state.page + 1
            };
        }

        case PlayerActions.ActionTypes.DECREMENT_MATCH_PAGE: {
            return {
                ...state,
                page: Math.max(state.page - 1, 0)
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
export const selectRegion = (state: State) => state.region;
export const selectPlayerName = (state: State) => state.playerName;
export const selectMatchPage = (state: State) => state.page;
export const selectPageSize = (state: State) => state.pageSize;




