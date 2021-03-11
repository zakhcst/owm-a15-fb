import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Select } from '@ngxs/store';
import { ConstantsService } from './services/constants.service';
import { AppInitService } from './services/app-init.service';
import { AppStatusState } from './states/app.state';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'owm-a11-fb';
  loading = false;
  subscriptions: Subscription;
  @Select(AppStatusState.showLoading) showLoading$: Observable<boolean>;

  constructor(private appInitService: AppInitService) {}
  
  ngOnInit() {
    this.setSubscribeDebounceLoadingActions();
  }

  setSubscribeDebounceLoadingActions() {
    this.subscriptions = this.showLoading$
      .pipe(
        debounceTime(50),
        distinctUntilChanged()
       )
      .subscribe((loading) => {
        this.loading = loading;
      });
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
