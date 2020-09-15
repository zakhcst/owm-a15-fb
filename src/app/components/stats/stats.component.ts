import { Component, OnInit, OnDestroy } from '@angular/core';
import { IOwmStats } from 'src/app/models/owm-stats.model';
import { ICities } from 'src/app/models/cities.model';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { Select } from '@ngxs/store';
import { AppStatusState, AppCitiesState, AppHistoryLogState, AppStatsState } from 'src/app/states/app.state';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IHistoryLog } from 'src/app/models/history-log.model';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  animations: [
    trigger('showStats', [
      transition(':enter', [
        query(':enter', [style({ opacity: 0 }), stagger('0.01s', [animate('0.2s', style({ opacity: 1 }))])], {
          optional: true,
        }),
      ]),
    ]),
  ],
})
export class StatsComponent implements OnInit, OnDestroy {
  stats: IOwmStats;
  cities: ICities;
  citiesLength = 0;
  loadingError = false;
  checkedCities = true;
  showDetails = {};
  subscriptions: Subscription;
  historyLog$: Observable<any[]>;

  @Select(AppStatusState.selectStatusIp) ip$: Observable<string>;
  @Select(AppCitiesState.selectCities) cities$: Observable<ICities>;
  @Select(AppHistoryLogState) historyLogState$: Observable<IHistoryLog>;
  @Select(AppStatsState) stats$: Observable<IOwmStats>;

  constructor() {}

  ngOnInit() {
    this.subscriptions = this.stats$.subscribe((stats) => {
      this.stats = stats;
    });

    this.subscriptions.add(
      this.cities$.subscribe((cities) => {
        this.cities = cities;
        this.citiesLength = Object.keys(this.cities).length;
      })
    );

    this.historyLog$ = this.historyLogState$.pipe(
      switchMap((historyLog: IHistoryLog) => {
        return of(
          Object.entries(historyLog)
            .map((ent: any[]) => {
              ent[1] = Object.entries(ent[1]).sort((a, b) => (a[0] < b[0] ? 1 : -1));
              ent[2] = ent[1].length > 10 ? ent[1].splice(0, 10) : ent[1];
              return ent;
            })
            .sort((a, b) => (a[2][0] < b[2][0] ? 1 : -1))
        );
      })
    );
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
