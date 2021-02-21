import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ConstantsService } from '../../services/constants.service';
import { HttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class ResolverRegisterIconsService implements Resolve<any> {
  constructor(private _http: HttpClient, private _sanitizer: DomSanitizer, iconRegistry: MatIconRegistry) {
    iconRegistry.addSvgIcon('settings', _sanitizer.bypassSecurityTrustResourceUrl(ConstantsService.iconSettings));
  }

  resolve(): Observable<any> {
    return of(true);
  }
}
