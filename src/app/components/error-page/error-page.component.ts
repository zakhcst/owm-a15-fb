import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, timer } from 'rxjs';
import { take, switchMap, map, last, takeUntil } from 'rxjs/operators';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
})
export class ErrorPageComponent implements OnInit {
  errorMessage: string;
  viewCount: number;
  cancelCoundown$ = new Subject<number>();

  activatedRouteData$ = this._activatedRoute.data.pipe(
    take(1),
    switchMap((activatedRouteData) => {
      this.errorMessage = activatedRouteData.errorMessage || 'ERROR';
      return timer(0, 1000);
    }),
    take(ConstantsService.redirectDelay + 1),
    map((timerCount: number) => {
      this.viewCount = ConstantsService.redirectDelay - timerCount;
      return this.viewCount;
    }),
    takeUntil(this.cancelCoundown$),
    last()
  );

  constructor(public _router: Router, public _activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.subscribeToActivatedRouteData();
  }

  subscribeToActivatedRouteData() {
    this.activatedRouteData$.subscribe((count) => {
      location.replace(location.origin);
    });
  }
  cancelCountdown() {
    this.cancelCoundown$.next(ConstantsService.redirectDelay + 1);
  }
}
