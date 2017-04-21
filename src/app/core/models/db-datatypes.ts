import { VgNamesMap } from './actors';
import { ItemOccurence } from './api-datatypes';

export class FirebaseMatch {
    id: string;
    createdAt: Date;
    duration: number;
    gameMode: string;
    patchVersion: string;
    shardId: string;
    endGameReason: string;
    queue: string;
    leftRoster: FirebaseRoster;
    rightRoster: FirebaseRoster;
    players: Array<{id: string, name: string}>;
    constructor(match: any) {
        // const match = response.data[matchIndex];
        this.id = match.id;
        this.createdAt = new Date(match.createdAt);
        this.duration = match.duration;
        this.gameMode = match.gameMode;
        this.patchVersion = match.patchVersion;
        this.shardId = match.shardId;
        this.endGameReason = match.endGameReason;
        this.queue = match.queue;
        this.leftRoster = new FirebaseRoster(match.leftRoster);
        this.rightRoster = new FirebaseRoster(match.rightRoster);
        this.players = match.players;
    }
    findOutcomeFor(playerName: string) {
        const inLeft = this.leftRoster.players.filter(player => player['name'] === playerName).length !== 0;
        const inRight = this.rightRoster.players.filter(player => player['name'] === playerName).length !== 0;
        const leftWon = this.leftRoster.winner;
        const rightWon = this.rightRoster.winner;
        return (inLeft && leftWon) || (inRight && rightWon);
    }
}

export class FirebaseRoster {
    acesEarned: string;
    gold: string;
    heroKills: string;
    krakenCaptures: string;
    turretKills: string;
    turretsRemaining: string;
    participants: [FirebaseParticipant, FirebaseParticipant, FirebaseParticipant];
    winner: boolean;
    players: Array<{id: string, name: string}>;
    // team: FlatTeam; Todo: Implement when teams are implemented
    constructor(roster: any) {
        this.acesEarned = roster.acesEarned;
        this.gold = roster.gold;
        this.heroKills = roster.heroKills;
        this.krakenCaptures = roster.krakenCaptures;
        this.turretKills = roster.turretKills;
        this.turretsRemaining = roster.turretsRemaining;
        this.participants = roster.participants && roster.participants.length ?
            roster.participants.map(item => new FirebaseParticipant(item)) : [];
        this.winner = roster.winner;
        this.players = roster.players || [];
    }
}

export class FirebaseParticipant {
    playerId: string;
    playerName: string;
    actor: string;
    assists: number;
    crystalMineCaptures: number;
    deaths: number;
    farm: number;
    firstAfkTime: number;
    goldMineCaptures: number;
    itemGrants: Array<ItemOccurence>;
    itemSells: Array<ItemOccurence>;
    itemUses: Array<ItemOccurence>;
    items: Array<string>;
    jungleKills: number;
    karmaLevel: number;
    kills: number;
    krakenCaptures: number;
    minionKills: number;
    nonJungleMinionKills: number;
    skillTier: string;
    skinKey: string;
    turretCaptures: number;
    wentAfk: boolean;
    winner: boolean;
    constructor(participant: any) {
        this.actor = participant.actor;
        this.assists = +participant.assists;
        this.crystalMineCaptures = +participant.crystalMineCaptures;
        this.deaths = +participant.deaths;
        this.farm = +participant.farm;
        this.firstAfkTime = +participant.firstAfkTime;
        this.goldMineCaptures = +participant.goldMineCaptures;
        this.itemGrants = participant.itemGrants;
        this.itemSells = participant.itemSells;
        this.itemUses = participant.itemUses;
        this.items = participant.items;
        this.jungleKills = +participant.jungleKills;
        this.karmaLevel = +participant.karmaLevel;
        this.kills = +participant.kills;
        this.krakenCaptures = +participant.krakenCaptures;
        this.minionKills = +participant.minionKills;
        this.nonJungleMinionKills = +participant.nonJungleMinionKills;
        this.skillTier = participant.skillTier;
        this.skinKey = participant.skinKey;
        this.turretCaptures = +participant.turretCaptures;
        this.wentAfk = participant.wentAfk;
        this.winner = participant.winner;
        this.playerId = participant.playerId;
        this.playerName = participant.playerName;
    }
}

export class FirebasePlayer {
    id: string;
    name: string;
    shardId: string;
    level: string;
    lifetimeGold: string;
    lossStreak: string ;
    played: number;
    played_ranked: string;
    winStreak: string;
    wins: number;
    xp: string;
    constructor(player: any) {
        this.id = player.id;
        this.name = player.name;
        this.shardId = player.shardId;
        this.level = player.level;
        this.lifetimeGold = player.lifetimeGold;
        this.lossStreak = player.lossStreak;
        this.played = +player.played;
        this.played_ranked = player.played_ranked;
        this.winStreak = player.winStreak;
        this.wins = +player.wins;
        this.xp = player.xp;
    }
}

export class FirebasePlayerMeta {
    id: string;
    playerName: string;
    matches: any;
    constructor(player: any) {
        this.id = player.playerID;
        this.playerName = player.key;
        this.matches = player.matches;
    }
}
