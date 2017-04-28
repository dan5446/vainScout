import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';

import {FirebaseMatch, FlatMatch, FlatPlayer} from '../core/models';
import * as fromRoot from '../core/store/reducers';

@Component({
    selector: 'vs-match-detail',
    templateUrl: './match-detail.component.html',
    styleUrls: ['./match-detail.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatchDetailComponent implements OnInit {
    _match: FirebaseMatch;
    @Input()
    set match(match) {
        this._match = match;
    }
    get match() {
        return this._match ? new FirebaseMatch(this._match) : this._match;
    }
    @Input() player: FlatPlayer;

    constructor(private store: Store<fromRoot.State>) {}

    ngOnInit() {}

    get playerWon() {
        if (!this.player || !this.match) {
            return false;
        } else {
            return this.match.findOutcomeFor(this.player.name);
        }
    }

    fromTime(isoString) {
        return moment(isoString).fromNow();
    }
}
