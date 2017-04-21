import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';

import { CoreModule } from './core/core.module';
import { ConsumerComponent } from './consumer.component';
import { environment } from '../environments/environment';

const configErrMsg = `You have not configured and imported the Firebase SDK.
Make sure you go through the codelab setup instructions.`;

const bucketErrMsg = `Your Firebase Storage bucket has not been enabled. Sorry
about that. This is actually a Firebase bug that occurs rarely. Please go and
re-generate the Firebase initialization snippet (step 4 of the codelab) and make
sure the storageBucket attribute is not empty. You may also need to visit the
Storage tab and paste the name of your bucket which is displayed there.`;

if (!environment.firebase) {
    if (!environment.firebase.apiKey) {
        window.alert(configErrMsg);
    } else if (environment.firebase.storageBucket === '') {
        window.alert(bucketErrMsg);
    }
}

const myFirebaseAuthConfig = {
    provider: AuthProviders.Google,
    method: AuthMethods.Popup
};

@NgModule({
    declarations: [
        ConsumerComponent,
    ],
    imports: [
        BrowserModule,
        HttpModule,
        AngularFireModule.initializeApp(environment.firebase, myFirebaseAuthConfig),
        CoreModule.forRoot()
    ],
    providers: [],
    bootstrap: [ConsumerComponent]
})
export class ConsumerModule { }
