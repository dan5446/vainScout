import { Observable } from 'rxjs/Observable';
import { FirebasePlayer, FirebaseMatch } from '../firebase/datatypes';
import * as MatchActions from './matches-actions';

export interface State {
    matches: Observable<FirebaseMatch>[];
    region: string;
    name: string;
}

const initialState: State = {
    matches: [],
    region: 'na',
    name: ''
};

export function reducer(state = initialState, action: MatchActions.All): State {
    switch (action.type) {
        case MatchActions.SEARCH: {
            return {
                ...state,
                region: action.payload.shardId,
                playerId: action.payload.name
            };
        }

        case MatchActions.SEARCH_DONE: {
            return {
                ...state,
                matches: action.payload
            };
        }

        default: {
            return state;
        }
    }
}