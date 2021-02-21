import { TestBed, waitForAsync } from '@angular/core/testing';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { SortCitiesPipe } from './pipes/sort-cities.pipe';

describe('AppComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AppComponent, SortCitiesPipe],
        imports: [AppModule, ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })],
        // imports: [AppModule],
        providers: [AppComponent],
      }).compileComponents();
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'owm-a11-fb'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('owm-a11-fb');
  });
});
