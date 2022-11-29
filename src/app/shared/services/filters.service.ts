import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { tap, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { APP_SETTINGS } from 'src/app/app.settings';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class FiltersService {
  parameterTypes$: Observable<any>;
  methodTypes$: Observable<any>;
  pcodeToMcode$: Observable<any>;
  regions$: Observable<any>;
  flagTypes;
  sampleFlags;
  resultsKey;
  databaseChoices;

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
    this.sampleFlags = APP_SETTINGS.sampleFlags();
    this.resultsKey = APP_SETTINGS.resultsKey();
    this.databaseChoices = APP_SETTINGS.databaseChoices();
  }

  // Observables for min and max year of map options
  public minYearSubject = new BehaviorSubject<number>(1980);
  minYear$ = this.minYearSubject.asObservable();

  public maxYearSubject = new BehaviorSubject<number>(2021);
  maxYear$ = this.maxYearSubject.asObservable();

  // functions to update the observables
  public getMinYear(min: number) {
    this.minYearSubject.next(min);
  }
  public getMaxYear(max: number) {
    this.maxYearSubject.next(max);
  }
}
