import { Component, OnInit, Input } from '@angular/core';
import { ApiStoreService } from '../api/api-store.service';
import { Observable } from 'rxjs/Observable';

import { FirebasePlayer, FirebaseMatch } from '../firebase/datatypes';

import { Store } from '@ngrx/store';
import * as fromRoot from '../core/reducers';

@Component({
    selector: 'vs-match-detail',
    templateUrl: './match-detail.component.html',
    styleUrls: ['./match-detail.component.css']
})
export class MatchDetailComponent implements OnInit {

    @Input() match: Observable<FirebaseMatch>;

    constructor(private store: Store<fromRoot.State>) {}

    ngOnInit() { }

    onSubmit() { }

}
