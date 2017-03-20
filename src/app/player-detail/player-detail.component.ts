import { Component, OnInit } from '@angular/core';
import { DiagnosticsStore } from '../diagnostics/diagnostics-store.service';
import { ApiStoreService } from '../api-store.service';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

import 'rxjs/add/operator/filter';
import { FlatMatch } from '../datatypes';

@Component({
    selector: 'vg-player-detail',
    templateUrl: './player-detail.component.html',
    styleUrls: ['./player-detail.component.css']
})
export class PlayerDetailComponent implements OnInit {

    private playerStats: any;
    private playerId: string;
    private matches: any;
    private commonHeroes: any;

    private _matches: FirebaseListObservable<any[]>;


    constructor(private diagnostics: DiagnosticsStore, private api: ApiStoreService, private af: AngularFire) { 
        this._matches = af.database.list('/matches');
    }

    ngOnInit() {
        this.api.playerStats.filter(item => item !== null)
            .subscribe(data => {
                this.playerStats = data;
                this.playerId = this.playerStats.id;
                this.api.commonHeroes.filter(item => item !== null)
                    .subscribe(matches => { this.matches = matches; this.getMains(); this.getFlatMatch(); });
            });
    }

    getMains() {
        if (this.matches) {
            let roles = this.matches.included
                .filter(item => item.type === 'participant')
                .filter(item => item.relationships.player.data.id === this.playerId);
            let latestRoleId = this.matches.data.sort((a, b) => b.attributes.createdAt - a.attributes.createdAt)[0];
            let roleMap = new Map<any, any>();
            let roleList = roles.forEach(role => {
                if (roleMap.has(role.attributes.actor)) {
                    roleMap.set(role.attributes.actor, roleMap.get(role.attributes.actor) + 1);
                } else { roleMap.set(role.attributes.actor, 1); }
            });
            let arr = Array.from(roleMap.entries());
            this.commonHeroes = arr.sort((a, b) => b[1] - a[1]).map(subArray => subArray[0]).splice(0, 4);
            this.commonHeroes = ["assets/images/CatherineCircle.png", "assets/images/ArdanCircle.png", "assets/images/GlaiveCircle.png"];
        }
    }

    getFlatMatch() {
        console.log(new FlatMatch(this.matches, 1));
        this.af.database.list('/matches').push(new FlatMatch(this.matches, 1));
    }

    onSubmit() {}

}
