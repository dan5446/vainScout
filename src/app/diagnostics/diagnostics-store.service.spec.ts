import { TestBed, inject } from '@angular/core/testing';

import { DiagnosticsStoreService } from './diagnostics-store.service';

describe('DiagnosticsStoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DiagnosticsStoreService]
    });
  });

  it('should ...', inject([DiagnosticsStoreService], (service: DiagnosticsStoreService) => {
    expect(service).toBeTruthy();
  }));
});
