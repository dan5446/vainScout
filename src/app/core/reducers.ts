import * as fromPlayer from './player-reducer';
import * as fromMatches from './matches-reducer';

export interface State {
    player: fromPlayer.State;
    matches: fromMatches.State;
}

export const reducers = {
    player: fromPlayer.reducer,
    matches: fromMatches.reducer
};

export function selectPlayer(state: State) {
    return state.player.player;
}

export function selectPlayerNotFound(state: State) {
    return state.player.playerNotFound;
}

export function selectMatches(state: State) {
    return state.matches.matches;
}