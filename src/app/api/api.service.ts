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
import { VgApiResponse } from './datatypes';

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

    getMatches(regionId, filters) {
        let d = new Date('2017/01/01');
        let queryString = defaults.host + (regionId || defaults.region) +
            '/matches?' + queries.sort('-createdAt') + '&' + filters + '&' + queries.startTime(d) + '&' + queries.page(0);
        return this.http
            .get(queryString, { headers: this.headers })
            .catch(err => Observable.throw(err))
            .map((res: Response) => new VgApiResponse(res.json()));
    }

    getMatchesUntilPrime(regionId, filters, dateTime: Date) {
        
    }

    getMatchesUntil(regionId, filters, dateTime: Date) {
        // console.log(Scheduler)
        const page = (rId, fs) => this.getMatches(rId, fs);
        let mts;
        let mr = this.matches;
        const getEarliest = (date, val) => val ? new Date(val.data[val.data.length - 1].attributes.createdAt) : new Date(date.getTime() - 60*1000);
        // this.matches.next(1);
        page(regionId, filters + '&' + queries.endTime(dateTime))
            .catch(err => Observable.throw(err))
            .take(1).subscribe(
                res => {
                    mts = res;
                });
        queue.schedule(function (dt) {
            console.log(mts, mts.data.length);
            let sub;
            if (dt > earliestApiMatchDate) {
                page(regionId, filters + '&' + queries.endTime(dt))
                .catch(err => Observable.throw(err))
                .take(1).subscribe(
                    res => {
                        mts = mts.combine(res);
                    },
                    err => {
                        console.log(err);
                        mr.next(mts);
                        sub.unsubscribe();
                    });
                console.log('before', dt);
                dt = getEarliest(dt, mts);
                console.log('earliest from last call: ', dt);
                sub = this.schedule(dt, 500);
                // sub = this.schedule(dt, 2000); // `this` references currently executing Action,
                // // which we reschedule with new state
                console.log('after', dt);
            }
        }, 2000, getEarliest(dateTime, mts));

        return this.matches.asObservable();
    }

    // getMatchesUntil(regionId, filters, dateTime: Date) {
    //     if (dateTime < new Date('2017/01/01')) { return Observable.empty(); }
    //     const page = this.getMatches(regionId, filters + '&' + queries.endTime(dateTime));
    //     const findOldest = (res) => res.data[res.data.length - 1];
    //     return page.expand(res => {
    //             const earliest = new Date(findOldest(res).attributes.createdAt);
    //             return this.getMatchesUntilR(regionId, filters, earliest, res);
    //         }).catch(err => {
    //             return Observable.empty();
    //         });
    // }

    // getMatchesUntilR(regionId, filters, dateTime: Date, aData = <VgApiResponse>{data: [], included: []}) {
    //     if (dateTime < new Date('2017/01/01')) { return Observable.empty(); }
    //     const page = this.getMatches(regionId, filters + '&' + queries.endTime(dateTime));
    //     const findOldest = (res) => res.data[res.data.length - 1];
    //     return page.map(res => {
    //             res.data = (<Array<any>>aData.data).concat(res.data);
    //             res.included = aData.included.concat(res.included);
    //             console.log(res);
    //             return res;
    //         }).expand(res => {
    //             const earliest = new Date(findOldest(res).attributes.createdAt);
    //             return this.getMatchesUntilR(regionId, filters, earliest, res);
    //         }).catch(err => {
    //             return Observable.forkJoin(Observable.from([aData]), Observable.empty());
    //         });
    // }

    // getMatchHistory(regionId, filters) {
    //     const toFilter = (match) => queries.endTime(new Date(match.attributes.createdAt));
    //     const findOldest = (res) => res.data[res.data.length - 1];
    //     const page = this.getMatches(regionId, filters);
    //     const rt = page.flatMap(res => { console.log(filters + '&' + toFilter(findOldest(res))); return this.getMatches(regionId, filters + '&' + toFilter(findOldest(res)));});
    //     console.log(rt);
    //     return Observable.forkJoin(rt);
    //     // firstPageObs.map(res => )
    //     // const earliest = new Date();
    //     // d.setDate(d.getDate() - 5000);
    //     // let queryString = defaults.host + (regionId || defaults.region) +
    //     //     '/matches?' + queries.sort('-createdAt') + '&' + filters + '&' + queries.startTime(d) + '&' + queries.page(0);
    //     // return this.http
    //     //     .get(queryString, { headers: this.headers })
    //     //     .map((res: Response) => new VgApiResponse(res.json()));
    // }

    getMatch(matchId: string) {
        return this.http
            .get(defaults.host + defaults.region + '/matches/' + matchId, { headers: this.headers })
            .map((res: Response) => new VgApiResponse(res.json()));
    }

    /** Fetch Specific Player by Id */
    getPlayerByName(playerName: string, region: string = 'na') {
        return this.http
            .get(defaults.host + defaults.region + '/players' + '?' + queries.players(playerName), { headers: this.headers })
            .map((res: Response) => new VgApiResponse(res.json()))
    }

    getPlayerById(playerId: string) {
        return this.http
            .get(defaults.host + defaults.region + '/players/' + playerId, { headers: this.headers })
            .map((res: Response) => new VgApiResponse(res.json()));
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
