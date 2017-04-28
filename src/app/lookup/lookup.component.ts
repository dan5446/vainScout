import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';

import {FirebaseService} from '../core/services';
import {SearchPlayer} from '../core/store/actions';
import * as fromRoot from '../core/store/reducers';

@Component({
    selector: 'vs-lookup',
    templateUrl: './lookup.component.html',
    styleUrls: ['./lookup.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LookupComponent implements OnInit {
    region = 'na';
    playerName = '';

    constructor(private store: Store<fromRoot.State>) {}

    ngOnInit() {}

    onSubmit() {
        this.store.dispatch(new SearchPlayer({region: this.region, name: this.playerName}));
    }
}
