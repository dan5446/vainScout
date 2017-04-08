import { Component, OnInit } from '@angular/core';
import { ApiStoreService } from '../api/api-store.service';
import { Observable } from 'rxjs/Observable';

import { FirebasePlayer, FirebaseMatch } from '../firebase/datatypes';

import { Store } from '@ngrx/store';
import * as fromRoot from '../core/reducers';

@Component({
    selector: 'vs-player-detail',
    templateUrl: './player-detail.component.html',
    styleUrls: ['./player-detail.component.css']
})
export class PlayerDetailComponent implements OnInit {

    player: Observable<FirebasePlayer>;
    matches: Observable<Observable<FirebaseMatch>[]>;
    playerNotFound: Observable<boolean>;

    constructor(private store: Store<fromRoot.State>) {
        this.player = store.select(fromRoot.selectPlayer);
        this.playerNotFound = store.select(fromRoot.selectPlayerNotFound);
        this.matches = store.select(fromRoot.selectMatches);
    }

    ngOnInit() { }

    onSubmit() { }

}
