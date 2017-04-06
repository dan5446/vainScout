import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AngularFireModule, AuthProviders, AuthMethods } from 'angularfire2';

import { AppComponent } from './app.component';
import { LookupComponent } from './lookup/lookup.component';
import { PlayerDetailComponent } from './player-detail/player-detail.component';

import { ApiService } from './api/api.service';
import { ApiStoreService } from './api/api-store.service';
import { FirebaseService } from './firebase/firebase.service';
import { FirebaseStore } from './firebase/firebase.store.service';

export const firebaseConfig = {
    apiKey: 'AIzaSyCRcnAyOhlAATlkFgIg6GJQkY-atcgT_6s',
    authDomain: 'vainscout.firebaseapp.com',
    databaseURL: 'https://vainscout.firebaseio.com',
    storageBucket: 'vainscout.appspot.com',
    messagingSenderId: '794390759871'
};

const myFirebaseAuthConfig = {
  provider: AuthProviders.Google,
  method: AuthMethods.Popup
};

@NgModule({
  declarations: [
    AppComponent,
    LookupComponent,
    PlayerDetailComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig, myFirebaseAuthConfig)
  ],
  providers: [
      ApiStoreService,
      ApiService,
      FirebaseService,
      FirebaseStore
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
