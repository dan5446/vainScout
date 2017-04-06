import { Component, OnInit } from '@angular/core';
import { ApiStoreService } from '../api/api-store.service';
import { AngularFire, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseStore } from '../firebase/firebase.store.service';

import 'rxjs/add/operator/filter';
import { FlatMatch, FlatRoster, FlatPlayer } from '../api/datatypes';
import { CommonNamesMap } from '../actors';

@Component({
    selector: 'vg-player-detail',
    templateUrl: './player-detail.component.html',
    styleUrls: ['./player-detail.component.css']
})
export class PlayerDetailComponent implements OnInit {

    playerStats: any;
    playerId: string;
    matches: any;
    commonHeroes: any;
    playerQueried = false;
    playerNotFound = false;

    private _matches: FirebaseObjectObservable<any>;
    private theMatches: FirebaseListObservable<any>;
    private __matches: any;

    constructor(private api: ApiStoreService, private af: AngularFire, private db: FirebaseService, public data: FirebaseStore) {
        // af.database.object('/region/na').set(null);
    }

    ngOnInit() {
        // this.af.database.object('/region/na/playerMeta/bloodBeast/matches').subscribe(data => console.log(data));

        // this.data.matches.subscribe(data => console.log(data));

        // this.api.playerStats.filter(item => item !== null)
        //     .subscribe(data => {
        //         this.playerQueried = true;
        //         this.playerStats = data;
        //         this.playerId = this.playerStats.id;
        //         this.api.commonHeroes.filter(item => item !== null)
        //             .subscribe(matches => { this.matches = matches; this.getMains(); this.apiToFirebase(); });
        //     });
        // this.db.playerStats.filter(item => item !== null)
        //     .subscribe(data => {
        //         this.playerQueried = true;
        //         this.playerStats = data;
        //         this.playerId = this.playerStats.id;
        //         // this.theMatches = this.af.database.list('/region/na/matches', {
        //         //     query: {
        //         //         orderByChild: ,
        //         //         equalTo: this.playerStats.id
        //         //     }
        //         // });
        //         // this.theMatches.subscribe(stuff => console.log(stuff));
        //         this.db.commonHeroes.filter(item => item !== null)
        //             .subscribe(matches => { this.matches = matches; this.getMains(); this.apiToFirebase(); });
        //     });
        // this.db.matches.filter(item => item !== null)
        //     .subscribe(data => console.log(data));
    }

    getMains() {
        // if (this.matches) {
        //     let roles = this.matches.included
        //         .filter(item => item.type === 'participant')
        //         .filter(item => item.relationships.player.data.id === this.playerId);
        //     let latestRoleId = this.matches.data.sort((a, b) => b.attributes.createdAt - a.attributes.createdAt)[0];
        //     let roleMap = new Map<any, any>();
        //     let roleList = roles.forEach(role => {
        //         if (roleMap.has(role.attributes.actor)) {
        //             roleMap.set(role.attributes.actor, roleMap.get(role.attributes.actor) + 1);
        //         } else { roleMap.set(role.attributes.actor, 1); }
        //     });
        //     let arr = Array.from(roleMap.entries());
        //     this.commonHeroes = arr.sort((a, b) => b[1] - a[1]).map(subArray => subArray[0]).splice(0, 4);
        //     // console.log(this.commonHeroes);
        //     this.commonHeroes = this.commonHeroes.map(item => CommonNamesMap.get(item).url);
        // }
    }

    // apiToFirebase() {
    //     this.matches.data.forEach(
    //         (match, index) => {
    //             this.af.database.object('/region/na/matches/' + match.id)
    //                 .subscribe(data => { if (!data.id) { this.flattenAndPost(match, index); } });
    //         }
    //     );
    // }

    // flattenAndPost(match, index) {
    //     const flatMatch = new FlatMatch(this.matches, index);
    //     this.af.database.object('/region/na/matches/' + match.id).set(flatMatch);

    //     // const leftRosterResponse = this.matches.included.filter(item => item.id === flatMatch.leftRosterId).pop();
    //     // const leftRoster = new FlatRoster(leftRosterResponse, this.matches.included);
    //     // this.af.database.object('/region/na/rosters/' + leftRoster.id)
    //     //     .subscribe(data => { if (!data.id) { this.af.database.object('/region/na/rosters/' + leftRoster.id).set(leftRoster); }});

    //     // const rightRosterResponse = this.matches.included.filter(item => item.id === flatMatch.rightRosterId).pop();
    //     // const rightRoster = new FlatRoster(rightRosterResponse, this.matches.included);
    //     // this.af.database.object('/region/na/rosters/' + rightRoster.id)
    //     //     .subscribe(data => { if (!data.id) { this.af.database.object('/region/na/rosters/' + rightRoster.id).set(rightRoster); }});

    //     const participants = flatMatch.leftRoster.participants.concat(flatMatch.rightRoster.participants);
    //     participants.forEach(
    //         item => {
    //             const player = new FlatPlayer(this.matches.included.filter(player => player.id === item.playerId).pop());
    //             this.af.database.object('/region/na/players/' + player.id).set(player);
    //             this.af.database.object('/region/na/playerMeta/' + player.name).update({ playerID: player.id });
    //             this.af.database.object('/region/na/playerMeta/' + player.name + '/matches/' + match.id).set(match.id);
    //     });
    //     // this.af.database.list('/region/na/playerMeta/bloodBeast/matches').subscribe(data => console.log(data));
    // }

    onSubmit() {}

}
