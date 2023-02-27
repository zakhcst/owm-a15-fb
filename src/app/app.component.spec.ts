import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { SortCitiesPipe } from './pipes/sort-cities.pipe';
import { AppInitService } from './services/app-init.service';
import { WindowRefService } from './services/window.service';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: any;
  let _window : any;
  let appInitService : any;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, SortCitiesPipe],
      imports: [AppModule],
      providers: [
        AppComponent,
        WindowRefService,
        { provide: AppInitService, useValue: { shutdown: function() { }}}
      ],
    }).compileComponents();
  })
  );
  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.debugElement.componentInstance;
    _window = TestBed.inject(WindowRefService);
    appInitService = TestBed.inject(AppInitService);
  }));
  
  it('should create the app', () => {
    expect(component).toBeTruthy();
    expect(component.title).toEqual('owm-a15-fb');
  });

  it('should destroy onbeforeunload', () => {
    const spyOnShutdown = spyOn(appInitService, 'shutdown');
    fixture.detectChanges();
    _window.nativeWindow.onbeforeunload();
    expect(spyOnShutdown).toHaveBeenCalledTimes(1);
  });
});
