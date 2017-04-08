import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ApiStoreService } from '../api/api-store.service';
import { FirebaseService } from '../firebase/firebase.service';

import { Store } from '@ngrx/store';
import { Search } from '../core/player-actions';
import * as fromRoot from '../core/reducers';

@Component({
    selector: 'vs-lookup',
    templateUrl: './lookup.component.html',
    styleUrls: ['./lookup.component.css']
})
export class LookupComponent implements OnInit {

    region = 'na';
    playerName: string;

    constructor(private store: Store<fromRoot.State>) { }

    ngOnInit() {}

    onSubmit() {
        this.store.dispatch(new Search({ region: this.region, name: this.playerName }));
    }

    changed(event: any) {
        console.log(event);
    }

}
