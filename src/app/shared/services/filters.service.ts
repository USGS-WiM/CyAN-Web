import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import { throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FiltersService {
  parameterTypes$: Observable<any>;
  methodTypes$: Observable<any>;
  pcodeToMcode$: Observable<any>;

  constructor(private httpClient: HttpClient) {
    this.parameterTypes$ = httpClient
      .get('http://127.0.0.1:5006/get_pcode_shortname/')
      .pipe(
        shareReplay(1),
        tap(() => console.log('aftersharing'))
      );
    this.methodTypes$ = httpClient
      .get('http://127.0.0.1:5006/get_mcode_shortname/')
      .pipe(
        shareReplay(1),
        tap(() => console.log('aftersharing'))
      );
    this.pcodeToMcode$ = httpClient
      .get('http://127.0.0.1:5006/pcode_to_mcode/')
      .pipe(
        shareReplay(1),
        tap(() => console.log('aftersharing'))
      );
  }
}
