import {NgModule, Optional, SkipSelf} from '@angular/core';
import {compose} from '@ngrx/core/compose';
import {EffectsModule} from '@ngrx/effects';
import {combineReducers, StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {storeFreeze} from 'ngrx-store-freeze';

import {environment} from '../../environments/environment';

import {ApiService, FirebaseService, MessagingService} from './services';
import {PlayerEffects} from './store/effects';
import {reducer} from './store/reducers';

@NgModule({
    imports: [
        StoreModule.provideStore(reducer),
        EffectsModule.run(PlayerEffects),
        StoreDevtoolsModule.instrumentOnlyWithExtension()
    ],
    declarations: []
})
export class CoreModule {
    static forRoot() {
        return {
            ngModule: CoreModule,
            providers: [
                ApiService,
                FirebaseService,
                MessagingService
            ]
        };
    }
    constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error('CoreModule is already loaded.Import it in the AppModule only');
        }
    }
}
