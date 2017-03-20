import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../api.service';

@Component({
    selector: 'vg-diagnostics',
    templateUrl: './diagnostics.component.html',
    styleUrls: ['./diagnostics.component.css']
})
export class DiagnosticsComponent implements OnInit {
    @Input() diagnostics: string[];

    constructor(private api: ApiService) { }

    ngOnInit() {}

}
