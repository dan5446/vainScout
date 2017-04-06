import { Component, OnInit } from '@angular/core';
import { ApiStoreService } from '../api/api-store.service';
import { FirebaseService } from '../firebase/firebase.service';
import { FirebaseStore } from '../firebase/firebase.store.service';


@Component({
    selector: 'vg-lookup',
    templateUrl: './lookup.component.html',
    styleUrls: ['./lookup.component.css']
})
export class LookupComponent implements OnInit {

    region = 'na';
    playerName: string;

    constructor(private api: ApiStoreService, private db: FirebaseService, private data: FirebaseStore) { }

    ngOnInit() {}

    onSubmit() {
        this.db.region = this.region;
        this.db.player = this.playerName;
        this.api.region = this.region;
        this.api.player = this.playerName;
        this.data.region = this.region;
        this.data.playerName = this.playerName;
        this.data.fetchPlayerData();
    }

    changed(event: any) {
        console.log(event);
    }

}
