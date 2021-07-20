import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { Observable, combineLatest, Subject, EMPTY, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComponentDisplayService {
  constructor(public httpClient: HttpClient) {}

  public aboutVisibleSubject = new BehaviorSubject<Boolean>(undefined);
  aboutVisible$ = this.aboutVisibleSubject.asObservable();

  public getAssociatedPicks(display: boolean) {
    this.aboutVisibleSubject.next(display);
  }
}
