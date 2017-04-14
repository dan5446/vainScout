import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import { FirebasePlayer, FirebaseMatch } from '../core/models';

import { Store } from '@ngrx/store';
import * as fromRoot from '../core/store/reducers';

@Component({
    selector: 'vs-match-detail',
    templateUrl: './match-detail.component.html',
    styleUrls: ['./match-detail.component.css']
})
export class MatchDetailComponent implements OnInit {

    @Input() match: Observable<FirebaseMatch>;

    constructor(private store: Store<fromRoot.State>) {}

    ngOnInit() { }

    fromTime(isoString) {
        return moment(isoString).fromNow();
    }

}
