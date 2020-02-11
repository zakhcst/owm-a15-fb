import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RequiredModules } from './modules/required-modules';
import { SortCitiesPipe } from './pipes/sort-cities.pipe';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, SortCitiesPipe],
      imports: [RequiredModules],
      providers: [AppComponent]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'owm-a8-fb'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('owm-a8-fb');
  });
});
