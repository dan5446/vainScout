import { NgModule, Optional, SkipSelf } from '@angular/core';
import { environment } from '../../environments/environment';
import { FirebaseService, ApiService } from './services';

@NgModule({
    imports: [],
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
