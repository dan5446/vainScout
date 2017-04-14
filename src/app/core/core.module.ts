import { NgModule, Optional, SkipSelf } from '@angular/core';

import { StoreModule, combineReducers, } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { compose } from '@ngrx/core/compose';
import { storeFreeze } from 'ngrx-store-freeze';

import { reducer } from './store/reducers';
import { PlayerEffects } from './store/effects';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../../environments/environment';

import { FirebaseService, ApiService } from './services';

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
                FirebaseService
            ]
        };
    }
    constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error('CoreModule is already loaded.Import it in the AppModule only');
        }
    }
}
