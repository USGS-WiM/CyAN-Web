import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { APP_SETTINGS } from 'src/app/app.settings';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class GraphSelectionsService {
  constructor(private httpClient: HttpClient, public snackBar: MatSnackBar) {}

  public graphPointsXSubject = new BehaviorSubject<any>(undefined);
  graphPointsX$ = this.graphPointsXSubject.asObservable();

  public graphPointsYSubject = new BehaviorSubject<any>(undefined);
  graphPointsY$ = this.graphPointsYSubject.asObservable();

  public allGraphDataYSubject = new BehaviorSubject<any>(undefined);
  allGraphDataY$ = this.allGraphDataYSubject.asObservable();

  public allGraphDataXSubject = new BehaviorSubject<any>(undefined);
  allGraphDataX$ = this.allGraphDataXSubject.asObservable();

  public tempResultsYSubject = new BehaviorSubject<any>(undefined);
  tempResultsY$ = this.tempResultsYSubject.asObservable();

  public tempResultsXSubject = new BehaviorSubject<any>(undefined);
  tempResultsX$ = this.tempResultsXSubject.asObservable();

  public resultsReadySubject = new BehaviorSubject<any>(undefined);
  resultsReady$ = this.resultsReadySubject.asObservable();

  public flagsSubject = new BehaviorSubject<any>(undefined);
  flags$ = this.flagsSubject.asObservable();
  public updateFlags(flags) {
    this.flagsSubject.next(flags);
  }

  public sidSubject = new BehaviorSubject<any>(undefined);
  sid$ = this.sidSubject.asObservable();

  public filterGraphPoints(tempResultsX, tempResultsY) {
    console.log('tempResultsX', tempResultsX.length);
    console.log('tempResultsY', tempResultsY.length);

    /*
    let test = [];
        for (let i = 0; i < tempResultsY.length; i++) {
          test.push(tempResultsY[i].sid);
        }
    for (let i = 0; i < tempResultsY.length; i++) {
      test.push(tempResultsY[i].sid);
    }
    console.log('test', test);
    for (let x = 0; x < test.length; x++) {
      for (let i = 0; i < test.length; i++) {
        if (test[x] === test[i]) {
          if (x !== i) {
          //  console.log('found a match', test[x], test[i], x, i);
          }
        }
      }
    } */

    let base = document.getElementById('base');
    this.graphPointsXSubject.next(undefined);
    this.graphPointsYSubject.next(undefined);
    let valuesX = [];
    let valuesY = [];
    let allDataX = [];
    let allDataY = [];
    let sid = [];

    if (tempResultsX && tempResultsY) {
      for (let i = 0; i < tempResultsX.length; i++) {
        for (let x = 0; x < tempResultsY.length; x++) {
          if (tempResultsY[x].sid == tempResultsX[i].sid) {
            valuesX.push(tempResultsX[i].result);
            valuesY.push(tempResultsY[x].result);
            allDataX.push(tempResultsX[i]);
            allDataY.push(tempResultsY[x]);
            sid.push(tempResultsY[x].sid);
          }
        }
      }
    }

    this.graphPointsYSubject.next(valuesY);
    this.allGraphDataYSubject.next(allDataY);
    this.graphPointsXSubject.next(valuesX);
    this.allGraphDataXSubject.next(allDataX);
    this.sidSubject.next(sid);
    base.classList.remove('initial-loader');
  }

  public getTempArrays(
    graphFilters: {
      meta: {
        north: number;
        south: number;
        east: number;
        west: number;
        min_year: number;
        max_year: number;
        include_NULL: false;
        satellite_align: boolean;
      };
      items;
    },
    axis: string
  ) {
    console.log('graphFilters', graphFilters);
    this.resultsReadySubject.next(false);
    return this.httpClient
      .post('http://127.0.0.1:5005/json_query', graphFilters)
      .subscribe((res: any[]) => {
        console.log('reached graph results', res);
        if (res.length === 0) {
          this.snackBar.open('No points match your query.', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
          });
        } else {
          if (axis === 'xAxis') {
            this.tempResultsXSubject.next(res);
          }
          if (axis === 'yAxis') {
            this.tempResultsYSubject.next(res);
            this.resultsReadySubject.next(true);
          }
        }
      });
  }
}
