import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Injectable} from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {environment} from '../../../environments/environment';
import {FlatPlayer, VgApiResponse} from '../models';
import {FirebasePlayer} from '../models';

const configErrMsg = `You have not configured and imported the Vainglory Api.`;

if (!environment.vgApi) {
    if (!environment.vgApi.apiKey) {
        window.alert(configErrMsg);
    }
}

export const earliestApiMatchDate = new Date('2017/02/13').toISOString();
export const baseUrl = 'https://api.dc01.gamelockerapp.com';

@Injectable()
export class ApiService {
    private headers;

    constructor(private http: Http) {
        this.headers =
            new Headers({'Accept': 'application/vnd.api+json', 'X-TITLE-ID': 'semc-vainglory', 'Authorization': environment.vgApi.apiKey});
    }

    getLatestMatches(region: string, playerName: string) {
        const uriComponents = [baseUrl, 'shards', region, 'matches'];
        const uriString = uriComponents.map(component => `${encodeURI(component)}`).join('/');
        const queries = {'filter[playerNames]': playerName, 'filter[createdAt-start]': earliestApiMatchDate, sort: '-createdAt'};
        const queryString = Object.entries(queries).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
        const requestString = [`${uriString}`, `${queryString}`].join('?');
        // console.log(uriString, queryString, requestString);

        return this.http.get(requestString, {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(err => Observable.of(new VgApiResponse({})));
        ;
    }

    getPlayer(playerName: string, region: string = 'na') {
        const uriComponents = [baseUrl, 'shards', region, 'players'];
        const uriString = uriComponents.map(component => `${encodeURI(component)}`).join('/');
        const queries = {'filter[playerNames]': playerName};
        const queryString = Object.entries(queries).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
        const requestString = [`${uriString}`, `${queryString}`].join('?');

        return this.http.get(requestString, {headers: this.headers})
            .map((res: Response) => new VgApiResponse(res.json()))
            .map(res => res.data[0])
            .map(player => new FlatPlayer(player))
            .catch(err => Observable.of(null));
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
