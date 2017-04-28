import {Component} from '@angular/core';
import {AngularFire, FirebaseListObservable} from 'angularfire2';
import * as firebase from 'firebase';
import {Observable} from 'rxjs/Observable';

declare var require: any;
@Component({selector: 'vs-root', templateUrl: './app.component.html', styleUrls: ['./app.component.css']})
export class AppComponent {
    title = 'vainScout';
    private playerStats: any;
    image: string;
    private loggedIn: boolean;

    constructor(public af: AngularFire) {}

    login() {
        this.af.auth.login();
    }

    logout() {
        this.af.auth.logout();
    }
}
