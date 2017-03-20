import { Component, OnInit } from '@angular/core';
import { DiagnosticsStore } from '../diagnostics/diagnostics-store.service';
import { ApiStoreService } from '../api-store.service';

@Component({
    selector: 'vg-lookup',
    templateUrl: './lookup.component.html',
    styleUrls: ['./lookup.component.css']
})
export class LookupComponent implements OnInit {

    private playerName = '';

    constructor(private diagnostics: DiagnosticsStore, private api: ApiStoreService) { }

    ngOnInit() {}

    private change(event: any) {
        this.diagnostics.diagnostic = [event.target.value];
    }

    onSubmit() {
        this.api.player = this.playerName;
    }

}
