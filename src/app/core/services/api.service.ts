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

import { VgApiResponse, FlatPlayer } from '../models';
import { FirebasePlayer } from '../models';
import { environment } from '../../../environments/environment';

const configErrMsg = `You have not configured and imported the Vainglory Api.`;

if (!environment.vgApi) {
    if (!environment.vgApi.apiKey) {
        window.alert(configErrMsg);
    }
}

export const earliestApiMatchDate = new Date('2017/02/13').toISOString();
export const baseUrl = 'https://api.dc01.gamelockerapp.com';

export const queriesyo = {
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
            'Authorization': environment.vgApi.apiKey
        });
    }

    getLatestMatches(region: string, playerName: string) {
        const uriComponents = [ baseUrl, 'shards', region, 'matches'];
        const uriString = uriComponents.map(component => `${encodeURI(component)}`).join('/');
        const queries = { 'filter[playerNames]': playerName, 'filter[createdAt-start]': earliestApiMatchDate, sort: '-createdAt' };
        const queryString = Object.entries(queries).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
        const requestString = [`${uriString}`, `${queryString}`].join('?');
        console.log(uriString, queryString, requestString);

        return this.http
            .get(requestString, { headers: this.headers })
            .catch(err => Observable.of(null))
            .map((res: Response) => new VgApiResponse(res.json()));
    }

    getPlayer(playerName: string, region: string = 'na') {
        const uriComponents = [ baseUrl, 'shards', region, 'players'];
        const uriString = uriComponents.map(component => `${encodeURI(component)}`).join('/');
        const queries = { 'filter[playerNames]': playerName };
        const queryString = Object.entries(queries).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
        const requestString = [`${uriString}`, `${queryString}`].join('?');

        return this.http
            .get(requestString, { headers: this.headers })
            .map((res: Response) => new VgApiResponse(res.json()))
            .map(res => res.data[0])
            .map(player => new FlatPlayer(player))
            .catch(error => Observable.of(null));
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
