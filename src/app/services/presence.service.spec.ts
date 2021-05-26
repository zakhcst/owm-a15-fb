import { DOCUMENT } from '@angular/common';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { AngularFireDatabase } from '@angular/fire/database';
import { MockAngularFireService } from './testing.services.mocks';
import { PresenceService } from './presence.service';
import { of } from 'rxjs';

describe('PresenceService', () => {
  let service: PresenceService;
  let _document: any;
  let mockAngularFireService: MockAngularFireService;
  let angularFireDatabase: any;

  beforeEach(() => {
    mockAngularFireService = new MockAngularFireService();

    TestBed.configureTestingModule({
      providers: [
        PresenceService,
        { provide: AngularFireDatabase, useValue: mockAngularFireService },
        { provide: DOCUMENT, useValue: { onvisibilitychange: function() {} }},
      ]
    });
    service = TestBed.inject(PresenceService);
    angularFireDatabase = TestBed.inject(AngularFireDatabase);
    _document = TestBed.inject(DOCUMENT);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should updateOnAway', () => {
    const testMessage = 'test result';
    service.updateOnAway( () => testMessage);
    expect(_document.onvisibilitychange()).toBe(testMessage);
  });

  it('should updateOnAway', waitForAsync(() => {
    const testMessage = 'test result';
    const spyOnValueChange = spyOn(mockAngularFireService.ref, 'valueChanges').and.returnValue(of(testMessage));
    service.updateOnConnected().subscribe(newValue => {
      expect(newValue).toBe(testMessage);
    });
  }));


});
