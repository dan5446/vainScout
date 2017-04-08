import { NgModule, Optional, SkipSelf } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { reducers } from './reducers';
import { EffectsModule } from '@ngrx/effects';
import { PlayerEffects } from './player-effects';

import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
    imports: [
        StoreModule.provideStore(reducers),
        EffectsModule.run(PlayerEffects),
        StoreDevtoolsModule.instrumentOnlyWithExtension()
    ],
    declarations: []
})
export class CoreModule {
    static forRoot() {
        return {
            ngModule: CoreModule,
        };
    }
    constructor( @Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
            throw new Error('CoreModule is already loaded.Import it in the AppModule only');
        }
    }
}
