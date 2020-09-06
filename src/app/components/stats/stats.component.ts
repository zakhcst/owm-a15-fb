import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IOwmStats } from 'src/app/models/owm-stats.model';
import { ICities } from 'src/app/models/cities.model';
import { trigger, style, animate, transition, query, stagger } from '@angular/animations';
import { Select } from '@ngxs/store';
import { AppStatusState, AppCitiesState } from 'src/app/states/app.state';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  historyLog: any[];
  citiesLength = 0;
  loadingError = false;
  checkedCities = true;
  showDetails = {};
  subscriptions: Subscription;

  @Select(AppStatusState.selectStatusIp) ip$: Observable<string>;

  constructor(private _activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.subscriptions = this._activatedRoute.data.subscribe((data) => {
      this.stats = data.stats;
      this.cities = data.cities;
      this.citiesLength = Object.keys(this.cities).length;

      this.historyLog = Object.entries(data.historyLog)
        .map((ent: any[]) => {
          ent[1] = Object.entries(ent[1]).sort((a, b) => (a[0] < b[0] ? 1 : -1));
          ent[2] = ent[1].length > 10 ? ent[1].splice(0, 10) : ent[1];
          return ent;
        })
        .sort((a, b) => (a[2][0] < b[2][0] ? 1 : -1));
    });
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
}
