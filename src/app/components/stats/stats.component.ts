import { Component, OnInit, OnDestroy } from '@angular/core';
import { IStats } from '../../models/stats.model';
import { ICities } from '../../models/cities.model';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { IHistoryLog } from '../../models/history-log.model';
import { Select } from '@ngxs/store';
import { AppStatusState, AppCitiesState, AppHistoryLogState, AppStatsState } from 'src/app/states/app.state';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ConstantsService } from '../../services/constants.service';

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
  stats: IStats[] | {};
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
  @Select(AppStatsState) stats$: Observable<IStats[]>;

  constructor() {}

  ngOnInit() {
    this.subscribeStats();
    this.subscribeHistory();
    this.subscribeCities();
  }
  
  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  subscribeStats() {
    this.subscriptions = this.stats$.subscribe((stats) => {
      if (stats) {
        this.stats = stats;
      }
    });
  }

  subscribeCities() {
    this.subscriptions.add(
      this.cities$.subscribe((cities) => {
        if (cities) {
          this.cities = cities;
          this.citiesLength = Object.keys(this.cities).length;
        }
      })
    );
  }

  subscribeHistory() {
    this.historyLog$ = this.historyLogState$.pipe(
      switchMap((historyLog: IHistoryLog) => {
        return of(
          Object.entries(historyLog)
            .filter((ent: any[]) => !ConstantsService.reservedIps.includes(ent[0]))
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
}
