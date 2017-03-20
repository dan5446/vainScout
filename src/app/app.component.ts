import { Component } from '@angular/core';
import { DiagnosticsStore } from './diagnostics/diagnostics-store.service';
import { Observable } from 'rxjs/Observable';
import { ApiStoreService } from './api-store.service';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

declare var require: any;
@Component({
    selector: 'vg-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'vainScout';
    private diagnostics: Observable<string[]>;
    private playerStats: any;
    image: string;
    private loggedIn: boolean;

    constructor(diagnostics: DiagnosticsStore, private api: ApiStoreService, private af: AngularFire) {
        this.diagnostics = diagnostics.diagnostics;
        // this.loggedIn = this.af.auth
        // const firebase = require('firebase');
        // const images = firebase.app().storage().ref().child('images');
        // const G7 = images.child('7Gold.png');
        // console.dir(G7.getDownloadURL().then(url => this.image = url));
    }

    ngOnInit() {
        this.api.playerStats.subscribe(data => this.playerStats = data)
    }

    login() {
        this.af.auth.login();
    }

    logout() {
        this.af.auth.logout();
    }

}
