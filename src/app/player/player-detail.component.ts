import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/withLatestFrom';

import { FirebaseService } from '../core/services/firebase.service';
import { FirebasePlayer, FirebaseMatch, FlatMatch, FlatPlayer } from '../core/models';

import { Store } from '@ngrx/store';
import * as fromRoot from '../core/store/reducers';
import * as Actions from '../core/store/actions';


@Component({
    selector: 'vs-player-detail',
    templateUrl: './player-detail.component.html',
    styleUrls: ['./player-detail.component.css']
})
export class PlayerDetailComponent implements OnInit {

    player: Observable<FlatPlayer>;
    page: Observable<number>;
    pageSize: Observable<number>;
    matches: Observable<Observable<FlatMatch>[]>;
    matchCount: Observable<number>;
    playerNotFound: Observable<boolean>;

    constructor(private store: Store<fromRoot.State>, private firebaseService: FirebaseService) {
        this.playerNotFound = store.select(fromRoot.selectPlayerNotFound);
        this.page = store.select(fromRoot.selectMatchPage);
        this.pageSize = store.select(fromRoot.selectPageSize);
        this.player = Observable.of(null);
        this.matches = Observable.of([]);
        store.select(fromRoot.selectPlayerName)
            .withLatestFrom(store.select(fromRoot.selectRegion))
            .withLatestFrom(store.select(fromRoot.selectPlayerNotFound))
            .subscribe(([[name, region ], notFound]) => {
                if (name && !notFound) {
                    this.player = this.firebaseService.fetchPlayer(name, region);
                    this.matches = this.firebaseService.fetchMatches(name, region);
                    this.matchCount = this.firebaseService.fetchMatchCount(name, region);
                } else {
                    this.player = Observable.of(null);
                    this.matches = Observable.of([]);
                    this.matchCount = Observable.of(0);
                }
            });
        store.select(fromRoot.selectMatchPage)
            .withLatestFrom(store.select(fromRoot.selectRegion))
            .withLatestFrom(store.select(fromRoot.selectPlayerName))
            .subscribe(([[page, region ], name]) => {
                this.matches = this.firebaseService.fetchMatches(name, region, page);
            });
    }

    ngOnInit() { }

    getRangeString(page, matchCount, pageSize, matches) {
        const matchesOnPage = matches.length;
        const firstIndex = (page * pageSize) + 1;
        const lastIndex = (page * pageSize) + matchesOnPage;
        return `${ firstIndex } to ${ lastIndex } of ${ matchCount }`;
    }

    lastPage(page, matchCount, pageSize, matches) {
        const matchesOnPage = matches.length;
        return (page * pageSize) + matchesOnPage >= matchCount;
    }

    decrementPage() {
        this.store.dispatch(new Actions.DecrementMatchPage(null));
    }

    incrementPage() {
        this.store.dispatch(new Actions.IncrementMatchPage(null));
    }

}
