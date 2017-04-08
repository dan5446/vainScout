import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/expand';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/empty';
import { Scheduler } from 'rxjs/Scheduler';
import { Action } from 'rxjs/scheduler/action';
import 'rxjs/scheduler/queue';
import { queue } from 'rxjs/scheduler/queue';
// import 'rxjs/add/scheduler/queue';

import { ApiStoreService } from './api-store.service';
import { VgApiResponse, FlatPlayer } from './datatypes';
import { FirebasePlayer } from '../firebase/datatypes';

export const defaults = {
    host: 'https://api.dc01.gamelockerapp.com/shards/',
    region: 'na',
    statusUrl: 'https://api.dc01.gamelockerapp.com/status',
    title: 'semc-vainglory',
};

export const regions = {
    'North America': 'na',
    'Europe': 'eu',
    'South America': 'sa',
    'East Asia': 'ea',
    'Southeast Asia': 'sg',
};

export const earliestApiMatchDate = new Date('2017/01/01');

export const queries = {
    // Default: 0	Allows paging over results
    page: (pageNum: number) => 'page[offset]=' + pageNum,
    // Default: 50	The default (and current maximum) is 50. Values less than 50 and great than 2 are supported.
    pageCount: (count: number) => 'page[limit]=' + count,
    // Default: createdAt	By default, Matches are sorted by creation time ascending.
    sort: (type: string) => 'sort=' + type,
    // 3hrs ago	Must occur before end time. Format is iso8601 Usage: filter[createdAt-start]=2017-01-01T08:25:30Z
    startTime: (time: Date) => 'filter[createdAt-start]=' + time.toISOString(),
    // Now	Queries search the last 3 hrs. Format is iso8601 i.e. filter[createdAt-end]=2017-01-01T13:25:30Z
    endTime: (time: Date) => 'filter[createdAt-end]=' + time.toISOString(),
    // none	Filters by player name. Usage: filter[playerNames]=player1,player2,...
    players: (names: string) => 'filter[playerNames]=' + names,
    // none	Filters by player Id. Usage: filter[playerIds]=playerId,playerId,...
    playerIds: (ids: string) => 'filter[playerIds]=' + ids,
    // none	Filters by team names. Usage: filter[teamNames]=team1,team2,...
    teams: (names: string) => 'filter[teamNames]=' + names,
    // none	filter by gameMode Usage: filter[gameMode]=casual,ranked,...
    mode: (mode: string) => 'filter[gameMode]=' + mode,
};

@Injectable()
export class ApiService {
    private headers;
    private matches: BehaviorSubject<VgApiResponse> = new BehaviorSubject(null);

    constructor(private http: Http) {
        this.headers = new Headers({
            'Accept': 'application/vnd.api+json',
            'X-TITLE-ID': 'semc-vainglory',
            // tslint:disable-next-line:max-line-length
            'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIwNGYzYTZhMC1kZDAwLTAxMzQtMTg5Yi0wMjQyYWMxMTAwMDQiLCJpc3MiOiJnYW1lbG9ja2VyIiwib3JnIjoiZGFuNTQ0Ni1nbWFpbC1jb20iLCJhcHAiOiIwNGVmZTM2MC1kZDAwLTAxMzQtMTg5YS0wMjQyYWMxMTAwMDQiLCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.fbhLFjBtA9GG7aOYo-4U1necI5axGbJCSKNcgPSjMMU'
        });
    }

    getLatestMatches(regionId, filters) {
        let d = new Date('2017/02/01');
        let queryString = defaults.host + (regionId || defaults.region) +
            '/matches?' + queries.sort('-createdAt') + '&' + filters + '&' + queries.startTime(d) + '&' + queries.page(0);
        return this.http
            .get(queryString, { headers: this.headers })
            .catch(err => Observable.throw(err))
            .map((res: Response) => new VgApiResponse(res.json()));
    }

    getMatchesUntilPrime(regionId, filters, dateTime: Date) {}

    getMatch(matchId: string, region = 'na') {
        return this.http
            .get(defaults.host + region + '/matches/' + matchId, { headers: this.headers })
            .map((res: Response) => new VgApiResponse(res.json()));
    }

    /** Fetch Specific Player by Id */
    getPlayerByName(playerName: string, region: string = 'na') {
        return this.http
            .get(defaults.host + region + '/players' + '?' + queries.players(playerName), { headers: this.headers })
            .map((res: Response) => new VgApiResponse(res.json()))
            .map(res => res.data[0])
            .map(player => new FlatPlayer(player))
            .catch(error => Observable.of(null));
    }

    getPlayerById(playerId: string, region: string = 'na') {
        return this.http
            .get(defaults.host + region + '/players/' + playerId, { headers: this.headers })
            .map((res: Response) => new VgApiResponse(res.json()))
            .map(response => new FlatPlayer(response.data[0]))
    }

    /** Not yet Implemented */
    // getTelemetry() {}

    // getTeams() {
    //     return this.http
    //         .get(defaults.host + defaults.region + '/teams', { headers: this.headers })
    //         .map((res: Response) => { console.log(res.json()); return new VgApiResponse(res.json());});
    // }

    // getTeam(teamId: string) {
    //     return this.http
    //         .get(defaults.host + defaults.region + '/teams/' + teamId, { headers: this.headers })
    //         .map((res: Response) => { console.log(res.json()); return new VgApiResponse(res.json());});
    // }

    // getLink() {}

}
