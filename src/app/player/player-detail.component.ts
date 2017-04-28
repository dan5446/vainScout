import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';

import {FlatMatch, FlatPlayer} from '../core/models';
import * as Actions from '../core/store/actions';
import * as fromRoot from '../core/store/reducers';


@Component({
    selector: 'vs-player-detail',
    templateUrl: './player-detail.component.html',
    styleUrls: ['./player-detail.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerDetailComponent implements OnInit {
    player: Observable<Observable<FlatPlayer>>;
    page: Observable<number>;
    pageSize: Observable<number>;
    matches: Observable<Observable<FlatMatch>[]>;
    matchCount: Observable<Observable<number>>;
    playerNotFound: Observable<boolean>;

    constructor(private store: Store<fromRoot.State>) {
        this.playerNotFound = store.select(fromRoot.selectPlayerNotFound);
        this.page = store.select(fromRoot.selectMatchPage);
        this.pageSize = store.select(fromRoot.selectPageSize);
        this.player = store.select(fromRoot.selectPlayer);
        this.matches = store.select(fromRoot.selectMatches);
        this.matchCount = store.select(fromRoot.selectMatchCount);
    }

    ngOnInit() {}

    getRangeString(page, matchCount, pageSize, matches) {
        const matchesOnPage = matches.length;
        const firstIndex = (page * pageSize) + 1;
        const lastIndex = (page * pageSize) + matchesOnPage;
        return `${firstIndex} to ${lastIndex} of ${matchCount}`;
    }

    lastPage(page, matchCount, pageSize, matches) {
        const matchesOnPage = matches.length;
        return (page * pageSize) + matchesOnPage >= matchCount;
    }

    decrementPage(page: Observable<number>) {
        page.take(1).subscribe(num => this.store.dispatch(new Actions.GoToMatchPage(num - 1)));
    }

    incrementPage(page: Observable<number>) {
        page.take(1).subscribe(num => this.store.dispatch(new Actions.GoToMatchPage(num + 1)));
    }
}
