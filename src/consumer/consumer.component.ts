import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFire, FirebaseListObservable } from 'angularfire2';

declare var require: any;
@Component({
    selector: 'vs-consumer',
    template: 'test'
})
export class ConsumerComponent {
    private loggedIn: boolean;

    constructor(public af: AngularFire) { }

}
