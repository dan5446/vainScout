import { VgNamesMap } from './actors';

export class VgApiResponse {
    data: any;
    errors: Array<any> | any;
    included: Array<VgDataType>;
    links: Array<any>;
    get playerCount() {
        return this.included.filter(item => item.type === 'player').length;
    }
    get participantCount() {
        return this.included.filter(item => item.type === 'participant').length;
    }
    get rosterCount() {
        return this.included.filter(item => item.type === 'roster').length;
    }
    public combine(next: any) {
        this.data = next.data ? this.data.concat(next.data) : this.data;
        this.included = next.included ? this.included.concat(next.included) : this.included;
        return this;
    }
    public constructor(kwargs: {
        data?: Array<VgDataType> | VgDataType,
        errors?: Array<any> | any,
        included?: Array<VgDataType>,
        links?: Array<any>,
    } = {}) {
        if (Array.isArray(kwargs.data)) {
            if (kwargs.data[0].type === 'match') {
                this.data = kwargs.data.map(item =>
                    // tslint:disable-next-line:max-line-length
                    new Match(item)).sort((a, b) => new Date(b.attributes.createdAt).valueOf() - new Date(a.attributes.createdAt).valueOf());
            }
            if (kwargs.data[0].type === 'player') { this.data = kwargs.data.map(item => new Player(item)); }
        } else if (kwargs.data.type === 'match') {
            this.data = new Match(kwargs.data);
        } else if (kwargs.data.type === 'player') {
            this.data = new Player(kwargs.data);
        } else { this.data = null; }
        this.errors = kwargs.errors || null;
        this.included = [];
        if (Array.isArray(kwargs.included)) {
            kwargs.included.forEach(item => {
                if (item.type === 'player') { this.included.push(new Player(item)); }
                else if ( item.type === 'roster') { this.included.push(new Roster(item)); }
                else if (item.type === 'participant') { this.included.push(new Participant(item)); }
                else { this.included.push(item); }
            });
        } else { this.included = null; }
        this.links = kwargs.links || null;
    }
}

export class VgDataType {
    id: string;
    type: string;
    constructor(kwargs:{
        id?: string,
        type?: string,
    } = {}) {
        this.id = kwargs.id;
        this.type = kwargs.type;
    }
}

export class Player extends VgDataType {
    attributes: PlayerAttributes;
    relationships: VgRelationship;
    constructor(kwargs:{
        id?: string,
        type?: string,
        attributes?: any,
        relationships?: any,
    } = {}) {
        super(kwargs);
        this.attributes = new PlayerAttributes(kwargs.attributes);
        this.relationships = new VgRelationship(kwargs.relationships);
    }
}

export class Match extends VgDataType {
    attributes: MatchAttributes;
    relationships: VgRelationship;
    constructor(kwargs: {
        id?: string,
        type?: string,
        attributes?: any,
        relationships?: Array<any>,
    } = {}) {
        super(kwargs);
        this.attributes = new MatchAttributes(kwargs.attributes);
        this.relationships = new VgRelationship(kwargs.relationships);
    }
}

export class Roster extends VgDataType {
    attributes: RosterAttributes;
    relationships: RosterRelationship;
    constructor(kwargs: {
        id?: string,
        type?: string,
        attributes?: any,
        relationships?: any,
    } = {}) {
        super(kwargs);
        this.attributes = new RosterAttributes(kwargs.attributes);
        this.relationships = new RosterRelationship(kwargs.relationships);
    }
}

export class VgDataArray {
    data: any;
    constructor(kwargs: {
        data?: Array<any>;
    } = {}) {
        if (Array.isArray(kwargs.data)) {
            this.data = [];
            kwargs.data.forEach(item => this.data.push(new VgDataType(item)));
        } else if (kwargs.data) {
            this.data = new VgDataType(kwargs.data);
        }
    }
}

export class Participant extends VgDataType {
    attributes: ParticipantAttributes;
    relationships: VgRelationship;
    constructor(kwargs: {
        id?: string,
        type?: string,
        attributes?: any,
        relationships?: Array<VgRelationship>,
    } = {}) {
        super(kwargs);
        this.attributes = new ParticipantAttributes(kwargs.attributes);
        this.relationships = new VgRelationship(kwargs.relationships);
    }
}

export class VgAttributes {
    shardId: string;
    titleId: string;
    constructor(kwargs: {
        shardId?: string,
        titleId?: string
    } = {}) {
        this.shardId = kwargs.shardId;
        this.titleId = kwargs.titleId;
    }
}

export class ParticipantAttributes {
    actor: string;
    stats: ParticipantStats;
    constructor(kwargs: {
        actor?: string,
        stats?: any,
    } = {}) {
        this.actor = VgNamesMap.get(kwargs.actor).name;
        this.stats = new ParticipantStats(kwargs.stats);
    }
}

export class MatchAttributes extends VgAttributes {
    createdAt: string;
    duration: number;
    gameMode: string;
    patchVersion: string;
    shardId: string;
    stats: MatchStats;
    titleId: string;
    constructor(kwargs:{
        createdAt?: string,
        duration?: number,
        gameMode?: string,
        patchVersion?: string,
        shardId?: string,
        stats?: MatchStats,
        titleId?: string
    } = {}) {
        super(kwargs);
        this.createdAt = kwargs.createdAt;
        this.duration = kwargs.duration;
        this.gameMode = kwargs.gameMode;
        this.patchVersion = kwargs.patchVersion;
        this.stats = new MatchStats(kwargs.stats);
    }
}

export class PlayerAttributes {
    createdAt: string;
    name: string;
    shardId: string;
    stats: PlayerStats;
    titleId: string;
    constructor(kwargs:{
        createdAt?: string;
        name?: string,
        shardId?: string,
        stats?: PlayerStats,
        titleId?: string,
    } = {}) {
        this.createdAt = kwargs.createdAt;
        this.name = kwargs.name;
        this.shardId = kwargs.shardId;
        this.stats = new PlayerStats(kwargs.stats);
        this.titleId = kwargs.titleId;
    }
}

export class RosterAttributes {
    stats: RosterStats;
    constructor(kwargs:{
        stats?: any,
    } = {}) {
        this.stats = new RosterStats(kwargs.stats);
    }
}

export class MatchStats {
    endGameReason: string;
    queue: string;
    constructor(kwargs:{
        endGameReason?: string,
        queue?: string,
    } = {}) {
        this.endGameReason = kwargs.endGameReason;
        this.queue = kwargs.queue;
    }
}

export class PlayerStats {
    level: string;
    lifetimeGold: string;
    lossStreak: string ;
    played: string;
    played_ranked: string;
    winStreak: string;
    wins: string;
    xp: string;
    constructor(kwargs:{
        level?: string,
        lifetimeGold?: string,
        lossStreak?: string,
        played?: string,
        played_ranked?: string,
        winStreak?: string,
        wins?: string,
        xp?: string,
    } = {}) {
        this.level = kwargs.level;
        this.lifetimeGold = kwargs.lifetimeGold;
        this.lossStreak = kwargs.lossStreak;
        this.played = kwargs.played;
        this.played_ranked = kwargs.played_ranked;
        this.winStreak = kwargs.winStreak;
        this.wins = kwargs.wins;
        this.xp = kwargs.xp;
    }
}

export class ItemOccurence {
    itemName: string;
    occurences: number;
    get displayName() {
        return VgNamesMap.get(this.itemName).name;
    }
    constructor(kwargs: {
        itemName?: any;
        occurences?: any;
    } = {}) {
        this.itemName = kwargs.itemName;
        this.occurences = kwargs.occurences || 0;
    }
}

export class ParticipantStats {
    assists: string;
    crystalMineCaptures: string;
    deaths: string;
    farm: string;
    firstAfkTime: string;
    goldMineCaptures: string;
    itemGrants: Array<ItemOccurence>;
    itemSells: Array<ItemOccurence>;
    itemUses: Array<ItemOccurence>;
    items: Array<string>;
    jungleKills: string;
    karmaLevel: string;
    kills: string;
    krakenCaptures: string;
    level: string;
    minionKills: string;
    nonJungleMinionKills: string;
    skillTier: string;
    skinKey: string;
    turretCaptures: string;
    wentAfk: boolean;
    winner: boolean;
    constructor(kwargs: {
        assists?: string,
        crystalMineCaptures?: string,
        deaths?: string,
        farm?: string,
        firstAfkTime?: string,
        goldMineCaptures?: string,
        itemGrants?: Object,
        itemSells?: Object,
        itemUses?: Object,
        items?: Array<string>,
        jungleKills?: string,
        karmaLevel?: string,
        kills?: string,
        krakenCaptures?: string,
        level?: string,
        minionKills?: string,
        nonJungleMinionKills?: string,
        skillTier?: string,
        skinKey?: string,
        turretCaptures?: string,
        wentAfk?: string,
        winner?: string,
    } = {}) {
        this.assists = kwargs.assists;
        this.crystalMineCaptures = kwargs.crystalMineCaptures;
        this.deaths = kwargs.deaths;
        this.farm = kwargs.farm;
        this.firstAfkTime = kwargs.firstAfkTime;
        this.goldMineCaptures = kwargs.goldMineCaptures;
        this.itemGrants = [];
        if (kwargs.itemGrants) {
            Object.keys(kwargs.itemGrants)
                .forEach(key => this.itemGrants.push(new ItemOccurence({itemName: key, occurences: kwargs.itemGrants[key]})));
        }
        this.itemSells = [];
        if (kwargs.itemSells) {
            Object.keys(kwargs.itemSells)
                .forEach(key => this.itemSells.push(new ItemOccurence({itemName: key, occurences: kwargs.itemSells[key]})));
        }
        this.itemUses = [];
        if (kwargs.itemUses) {
            Object.keys(kwargs.itemUses)
                .forEach(key => this.itemUses.push(new ItemOccurence({itemName: key, occurences: kwargs.itemUses[key]})));
        }
        this.items = kwargs.items;
        this.jungleKills = kwargs.jungleKills;
        this.karmaLevel = kwargs.karmaLevel;
        this.kills = kwargs.kills;
        this.krakenCaptures = kwargs.krakenCaptures;
        this.level = kwargs.level;
        this.minionKills = kwargs.minionKills;
        this.nonJungleMinionKills = kwargs.nonJungleMinionKills;
        this.skillTier = kwargs.skillTier;
        this.skinKey = kwargs.skinKey;
        this.turretCaptures = kwargs.turretCaptures;
        this.wentAfk = kwargs.wentAfk === 'true';
        this.winner = kwargs.winner === 'true';
    }
}

export class RosterStats {
    acesEarned: string;
    gold: string;
    heroKills: string;
    krakenCaptures: string;
    side: string;
    turretKills: string;
    turretsRemaining: string;
    constructor(kwargs:{
        acesEarned?: string,
        gold?: string,
        heroKills?: string,
        krakenCaptures?: string,
        side?: string,
        turretKills?: string,
        turretsRemaining?: string,
    } = {}) {
        this.acesEarned = kwargs.acesEarned;
        this.gold = kwargs.gold;
        this.heroKills = kwargs.heroKills;
        this.krakenCaptures = kwargs.krakenCaptures;
        this.side = kwargs.side;
        this.turretKills = kwargs.turretKills;
        this.turretsRemaining = kwargs.turretsRemaining;
    }
}

export class VgRelationship {
    assets: VgDataArray;
    rosters: VgDataArray;
    rounds: VgDataArray;
    player: VgDataArray;
    constructor(kwargs:{
        assets?: any,
        rosters?: any,
        rounds?: any,
        player?: any
    } = {}) {
        this.assets = new VgDataArray(kwargs.assets);
        this.rosters = new VgDataArray(kwargs.rosters);
        this.rounds = new VgDataArray(kwargs.rounds);
        this.player = new VgDataArray(kwargs.player);
    }
}

export class RosterRelationship {
    participants: VgDataArray;
    team: VgDataArray;
    constructor(kwargs: {
        participants?: any;
        team?: any;
    } = {}) {
        this.participants = new VgDataArray(kwargs.participants);
        this.team = new VgDataArray(kwargs.team);
    }
}

export class RosterParticipants {
    data: Array<VgDataType>;
    constructor(kwargs: {
        data?: Array<any>;
    } = {}) {
        this.data = [];
        if (Array.isArray(kwargs.data)) {
            kwargs.data.forEach(item => this.data.push(new VgDataType(item)));
        }
    }
}

export class RosterTeam {
    participants: RosterParticipants;
    team: RosterTeam;
    constructor(kwargs:{
        participants?: any;
        team?: any;
    } = {}) {
        this.participants = kwargs.participants;
        this.team = kwargs.team;
    }
}


export class Team {
    constructor() {}
}

export class Telemetry {
    constructor() {}
}



/** Flattened Datatypes */
export class FlatMatch {
    id: string;
    createdAt: string;
    duration: number;
    gameMode: string;
    patchVersion: string;
    shardId: string;
    endGameReason: string;
    queue: string;
    leftRoster: FlatRoster;
    rightRoster: FlatRoster;
    winner: 'left' | 'right';
    players: Array<any>;
    constructor(response: VgApiResponse, matchIndex: number) {
        const match = response.data[matchIndex];
        this.id = match.id;
        this.createdAt = match.attributes.createdAt;
        this.duration = match.attributes.duration;
        this.gameMode = match.attributes.gameMode;
        this.patchVersion = match.attributes.patchVersion;
        this.shardId = match.attributes.shardId;
        this.endGameReason = match.attributes.stats.endGameReason;
        this.queue = match.attributes.stats.queue;
        const rosterIds: [string, string] = [match.relationships.rosters.data[0].id, match.relationships.rosters.data[1].id];
        const left = this.findRoster('left', rosterIds, response.included);
        const right = this.findRoster('right', rosterIds, response.included);
        this.leftRoster = new FlatRoster(left, response.included);
        this.rightRoster = new FlatRoster(right, response.included);
        this.players = this.leftRoster.players.concat(this.rightRoster.players);
    }

    private findRoster(side: 'left' | 'right', rosterIds: [string, string], included: Array<any>) {
        return included
            .filter(item => item.type === 'roster')
            .filter(roster => rosterIds.indexOf(roster.id) >= 0)
            .filter(item => item.attributes.stats.side.includes(side))
            .pop();
    }
}

export class FlatRoster {
    acesEarned: string;
    gold: string;
    heroKills: string;
    krakenCaptures: string;
    turretKills: string;
    turretsRemaining: string;
    participants: [FlatParticipant, FlatParticipant, FlatParticipant];
    winner: boolean;
    players: Array<FlatPlayer>;
    // team: FlatTeam; Todo: Implement when teams are implemented
    constructor(roster: Roster, included: Array<any>) {
        this.acesEarned = roster.attributes.stats.acesEarned;
        this.gold = roster.attributes.stats.gold;
        this.heroKills = roster.attributes.stats.heroKills;
        this.krakenCaptures = roster.attributes.stats.krakenCaptures;
        this.turretKills = roster.attributes.stats.turretKills;
        this.turretsRemaining = roster.attributes.stats.turretsRemaining;
        const participantIds = roster.relationships.participants.data.map(item => item.id);
        const participantList = this.findParticipants(participantIds, included);
        const players = included.filter(item => item.type === 'player');
        this.participants = <[FlatParticipant, FlatParticipant, FlatParticipant]>participantList
            .map(participant => new FlatParticipant(participant, players));
        this.winner = this.participants.length ? this.participants[0].winner : false;
        this.players = this.participants.map(item => item.player);
    }
    private findParticipants(ids: Array<string>, included: Array<any>) {
        return included
            .filter(item => item.type === 'participant')
            .filter(participant => ids.indexOf(participant.id) >= 0);
    }
}

export class FlatParticipant {
    playerId: string;
    player: FlatPlayer;
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
    constructor(participant: Participant, players: Array<any>) {
        this.actor = participant.attributes.actor;
        this.assists = +participant.attributes.stats.assists;
        this.crystalMineCaptures = +participant.attributes.stats.crystalMineCaptures;
        this.deaths = +participant.attributes.stats.deaths;
        this.farm = +participant.attributes.stats.farm;
        this.firstAfkTime = +participant.attributes.stats.firstAfkTime;
        this.goldMineCaptures = +participant.attributes.stats.goldMineCaptures;
        this.itemGrants = participant.attributes.stats.itemGrants;
        this.itemSells = participant.attributes.stats.itemSells;
        this.itemUses = participant.attributes.stats.itemUses;
        this.items = participant.attributes.stats.items;
        this.jungleKills = +participant.attributes.stats.jungleKills;
        this.karmaLevel = +participant.attributes.stats.karmaLevel;
        this.kills = +participant.attributes.stats.kills;
        this.krakenCaptures = +participant.attributes.stats.krakenCaptures;
        this.minionKills = +participant.attributes.stats.minionKills;
        this.nonJungleMinionKills = +participant.attributes.stats.nonJungleMinionKills;
        this.skillTier = participant.attributes.stats.skillTier;
        this.skinKey = participant.attributes.stats.skinKey;
        this.turretCaptures = +participant.attributes.stats.turretCaptures;
        this.wentAfk = participant.attributes.stats.wentAfk;
        this.winner = participant.attributes.stats.winner;
        this.playerId = participant.relationships.player.data.id;
        this.player = new FlatPlayer(players.filter(player => player.id === this.playerId).pop());
    }
}

export class FlatPlayer {
    id: string;
    name: string;
    shardId: string;
    level: number;
    lifetimeGold: number;
    lossStreak: number;
    played: number;
    played_ranked: number;
    winStreak: number;
    wins: number;
    xp: number;
    matches: Array<string>;
    constructor(player: Player, matches: Array<Match> = null) {
        this.id = player.id;
        this.name = player.attributes.name;
        this.shardId = player.attributes.shardId;
        this.level = +player.attributes.stats.level;
        this.lifetimeGold = +player.attributes.stats.lifetimeGold;
        this.lossStreak = +player.attributes.stats.lossStreak;
        this.played = +player.attributes.stats.played;
        this.played_ranked = +player.attributes.stats.played_ranked;
        this.winStreak = +player.attributes.stats.winStreak;
        this.wins = +player.attributes.stats.wins;
        this.xp = +player.attributes.stats.xp;
        this.matches = matches ? matches.map(item => item.id) : [];
    }
}