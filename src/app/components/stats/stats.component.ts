import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { IStats } from '../../models/stats.model';
import { ICities } from '../../models/cities.model';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { IHistoryLog } from '../../models/history-log.model';
import { Select } from '@ngxs/store';
import { AppStatusState, AppCitiesState, AppHistoryLogState, AppStatsState } from 'src/app/states/app.state';
import { Observable, of, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { ConstantsService } from '../../services/constants.service';
import { ErrorsService } from 'src/app/services/errors.service';

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
  checkedCities = true;
  showDetails = {};
  subscriptions: Subscription;
  historyLog: any = null;
  showErrors = false;
  firstShowErrors = true;
  showErrorsDetails = {};
  errorsLog: any = null;

  @Select(AppStatusState.selectStatusIp) ip$: Observable<string>;
  @Select(AppCitiesState.selectCities) cities$: Observable<ICities>;
  @Select(AppHistoryLogState) historyLogState$: Observable<IHistoryLog>;
  @Select(AppStatsState) stats$: Observable<IStats[]>;
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'e') {
      this.toggleShowErrors();
    }
  }

  constructor(private errorsService: ErrorsService) {}

  ngOnInit() {
    this.subscribeStats();
    this.subscribeCities();
    this.subscribeHistoryLog();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  subscribeStats() {
    this.subscriptions = this.stats$.pipe(filter((stats) => !!stats)).subscribe((stats) => {
      this.stats = stats;
    });
  }

  subscribeCities() {
    this.subscriptions.add(
      this.cities$.pipe(filter((cities) => !!cities)).subscribe((cities) => {
        this.cities = cities;
        this.citiesLength = Object.keys(this.cities).length;
      })
    );
  }

  setLog$(log$: Observable<any>, filterIp: boolean) {
    return log$.pipe(filter((log) => !!log)).pipe(
      switchMap((log) => {
        const sortedTrimmedEntries = Object.entries(log)
          .filter((ent: any[]) => !filterIp || !ConstantsService.reservedIps.includes(ent[0]))
          .map((ent: any[]) => {
            ent[1] = Object.entries(ent[1]).sort((a, b) => (a[0] < b[0] ? 1 : -1));
            ent[2] = ent[1].slice(0, 11);
            return ent;
          })
          .sort((a, b) => (a[2][0] < b[2][0] ? 1 : -1));

        return of(sortedTrimmedEntries);
      })
    );
  }

  subscribeErrorsLog() {
    this.subscriptions.add(
      this.setLog$(this.errorsService.getData(), false).subscribe((errorsLog) => {
        this.errorsLog = errorsLog;
      })
    );
  }

  subscribeHistoryLog() {
    this.subscriptions.add(
      this.setLog$(this.historyLogState$, true).subscribe((historyLog) => {
        this.historyLog = historyLog;
      })
    );
  }

  toggleShowErrors() {
    this.showErrors = !this.showErrors;
      if (this.showErrors && this.firstShowErrors) {
        this.firstShowErrors = false;
        this.subscribeErrorsLog();
      }
  }

}
