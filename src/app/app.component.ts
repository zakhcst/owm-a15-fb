import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { AppInitService } from './services/app-init.service';
import { AppStatusState } from './states/app.state';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { WindowRefService } from './services/window.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'owm-a11-fb';
  loading: Observable<boolean>;

  @Select(AppStatusState.showLoading) showLoading$: Observable<boolean>;

  constructor(private appInitService: AppInitService, private _windowRef: WindowRefService) {
    this.loading = this.showLoading$.pipe(
      startWith(false),
      distinctUntilChanged(), 
      debounceTime(50)
    );
  }

  ngOnInit() {
    this._windowRef.nativeWindow.onbeforeunload = () => this.ngOnDestroy();
  }

  ngOnDestroy() {
    this.appInitService.shutdown();
  }
}
