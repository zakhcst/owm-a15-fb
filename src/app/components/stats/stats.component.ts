import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IOwmStats } from 'src/app/models/owm-stats.model';
import { ICities } from 'src/app/models/cities.model';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  animations: [
    trigger('showStats', [
      transition(':enter', [
        query(
          ':enter',
          [
            style({ opacity: 0 }),
            stagger('0.01s', [animate('0.2s', style({ opacity: 1 }))])
          ],
          { optional: true }
        )
      ])
    ])
  ]
})
export class StatsComponent implements OnInit {
  ip: string;
  stats: IOwmStats;
  cities: ICities;
  historyLog: any[];
  citiesLength = 0;
  loadingError = false;
  checkedCities = true;
  showDetails = {};

  constructor(private _activatedRoute: ActivatedRoute, private _router: Router) {}

  ngOnInit() {
    this._activatedRoute.data.subscribe(data => {
      this.ip = data.ip;
      this.stats = data.stats;
      this.cities = data.cities;
      this.citiesLength = Object.keys(data.cities).length;
      this.historyLog = Object.entries(data.historyLog)
        .map((ent: any[]) => {
          ent[1] = Object.entries(ent[1]).sort((a, b) =>
            a[0] < b[0] ? 1 : -1
          );
          ent[2] = ent[1].length > 10 ? ent[1].splice(0, 10) : ent[1];
          return ent;
        })
        .sort((a, b) => (a[2][0] < b[2][0] ? 1 : -1));
    });
  }
}
