import { FirebasePlayer } from '../firebase/datatypes';
import * as PlayerActions from './player-actions';

export interface State {
    searchTerm: string;
    region: string;
    player: FirebasePlayer;
    playerNotFound: boolean;
}

const initialState: State = {
    searchTerm: '',
    region: 'na',
    player: null,
    playerNotFound: false
};

export function reducer(state = initialState, action: PlayerActions.All): State {
    switch (action.type) {
        case PlayerActions.SEARCH: {
            return {
                ...state,
                searchTerm: action.payload.term,
                region: action.payload.region,
                playerNotFound: false
            };
        }

        case PlayerActions.SEARCH_SUCCESS: {
            return {
                ...state,
                player: action.payload
            };
        }

       case PlayerActions.SEARCH_FAIL: {
            return {
                ...state
            };
        }

        case PlayerActions.LOOKUP: {
            return {
                ...state,
            };
        }

        case PlayerActions.LOOKUP_SUCCESS: {
            return {
                ...state,
                player: action.payload
            };
        }

        case PlayerActions.LOOKUP_FAIL: {
            return {
                ...state,
                player: action.payload,
                playerNotFound: true
            };
        }

        case PlayerActions.UPDATE_FIREBASE_PLAYER: {
            return {
                ...state,
            };
        }

        default: {
            return state;
        }
    }
}