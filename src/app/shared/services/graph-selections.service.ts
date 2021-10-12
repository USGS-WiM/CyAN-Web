import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APP_SETTINGS } from 'src/app/app.settings';
import { HttpClient } from '@angular/common/http';
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
    this.resultsReadySubject.next(false);
    return this.httpClient
      .post(APP_SETTINGS.wqDataURL, graphFilters)
      .subscribe((res: any[]) => {
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
