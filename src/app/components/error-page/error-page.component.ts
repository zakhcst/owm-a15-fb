import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';
import { take, switchMap, map, last } from 'rxjs/operators';
import { ConstantsService } from 'src/app/services/constants.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
})
export class ErrorPageComponent implements OnInit {
  redirectPage: string;
  errorMessage: string;
  viewCount: number;
  activatedRouteParams = this._activatedRoute.params.pipe(
    take(1),
    switchMap((activatedRouteParams) => {
      this.errorMessage = activatedRouteParams.errorMessage || 'ERROR';
      this.redirectPage = activatedRouteParams.redirectPage || '';
      return timer(0, 1000);
    }),
    take(ConstantsService.redirectDelay + 1),
    map((timerCount: number) => {
      this.viewCount = ConstantsService.redirectDelay - timerCount;
    }),
    last()
  );

  constructor(public _router: Router, public _activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.subscribeToActivatedRouteParams();
  }
  
  subscribeToActivatedRouteParams() {
    this.activatedRouteParams.subscribe(() => {
      this._router.navigate([this.redirectPage || '']);
    });
  }
}
