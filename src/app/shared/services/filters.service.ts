import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { tap, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { APP_SETTINGS } from 'src/app/app.settings';

@Injectable({
  providedIn: 'root',
})
export class FiltersService {
  parameterTypes$: Observable<any>;
  methodTypes$: Observable<any>;
  pcodeToMcode$: Observable<any>;
  regions$: Observable<any>;
  flagTypes;

  constructor(private httpClient: HttpClient) {
    //Each of these is used to retrieve data for populating dropdown menus
    this.parameterTypes$ = httpClient.get(APP_SETTINGS.pcodeShortnameURL).pipe(
      shareReplay(1),
      tap(() => console.log('aftersharing'))
    );
    this.methodTypes$ = httpClient.get(APP_SETTINGS.mcodeShortnameURL).pipe(
      shareReplay(1),
      tap(() => console.log('aftersharing'))
    );
    this.pcodeToMcode$ = httpClient.get(APP_SETTINGS.pcodeToMcodeURL).pipe(
      shareReplay(1),
      tap(() => console.log('aftersharing'))
    );
    this.regions$ = httpClient.get(APP_SETTINGS.regionListURL).pipe(
      shareReplay(1),
      tap(() => console.log('aftersharing'))
    );
    this.flagTypes = APP_SETTINGS.flagTypes();
  }
}
