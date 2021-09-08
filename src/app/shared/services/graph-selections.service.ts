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

  public flagsSubject = new BehaviorSubject<any>(undefined);
  flags$ = this.flagsSubject.asObservable();
  public updateFlags(flags) {
    this.flagsSubject.next(flags);
  }

  public sidSubject = new BehaviorSubject<any>(undefined);
  sid$ = this.sidSubject.asObservable();

  public filterGraphPointsOld(graphFilters: {
    north: number;
    south: number;
    east: number;
    west: number;
    min_year: number;
    max_year: number;
    include_NULL: Boolean;
    satellite_align: Boolean;
    paramX: [];
    paramY: [];
    methodsX: [];
    methodsY: [];
  }) {
    let base = document.getElementById('base');
    base.classList.add('initial-loader');
    this.graphPointsXSubject.next(undefined);
    this.graphPointsYSubject.next(undefined);
    let tempResultsX = [];
    let tempResultsY = [];
    let resultsX = [];
    let resultsY = [];
    let valuesX = [];
    let valuesY = [];
    let allDataX = [];
    let allDataY = [];
    let sid = [];
    const url =
      APP_SETTINGS.wqPoints +
      '/?minlat=' +
      -90 +
      '&maxlat=' +
      90 +
      '&minlong=' +
      -180 +
      '&maxlong=' +
      180;
    return this.httpClient.get(url).subscribe((res: any[]) => {
      if (res.length === 0) {
        this.snackBar.open('No points match your query.', 'OK', {
          duration: 4000,
          verticalPosition: 'top',
        });
      } else {
        for (let i = 0; i < res.length; i++) {
          if (graphFilters.paramY == res[i].pcode) {
            if (graphFilters.methodsY == res[i].mcode) {
              tempResultsY.push(res[i]);
            }
          }
          if (graphFilters.paramX == res[i].pcode) {
            if (graphFilters.methodsX == res[i].mcode) {
              tempResultsX.push(res[i]);
            }
          }
        }
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
        this.graphPointsXSubject.next(valuesX);
        this.graphPointsYSubject.next(valuesY);
        this.allGraphDataYSubject.next(allDataY);
        this.allGraphDataXSubject.next(allDataX);
        this.sidSubject.next(sid);
      }

      base.classList.remove('initial-loader');
    });
  }

  public filterGraphPoints(graphFilters: {
    north: number;
    south: number;
    east: number;
    west: number;
    min_year: number;
    max_year: number;
    include_NULL: Boolean;
    satellite_align: Boolean;
    paramX: [];
    paramY: [];
    methodsX: [];
    methodsY: [];
  }) {
    let base = document.getElementById('base');
    base.classList.add('initial-loader');
    this.graphPointsXSubject.next(undefined);
    this.graphPointsYSubject.next(undefined);
    let tempResultsX = [];
    let tempResultsY = [];
    let resultsX = [];
    let resultsY = [];
    let valuesX = [];
    let valuesY = [];
    let allDataX = [];
    let allDataY = [];
    let sid = [];
    const url =
      APP_SETTINGS.wqPoints +
      '/?minlat=' +
      -90 +
      '&maxlat=' +
      90 +
      '&minlong=' +
      -180 +
      '&maxlong=' +
      180;
    return this.httpClient
      .post('http://127.0.0.1:5005/json_query', graphFilters)
      .subscribe((res: any[]) => {
        if (res.length === 0) {
          this.snackBar.open('No points match your query.', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
          });
        } else {
          for (let i = 0; i < res.length; i++) {
            if (graphFilters.paramY == res[i].pcode) {
              if (graphFilters.methodsY == res[i].mcode) {
                tempResultsY.push(res[i]);
              }
            }
            if (graphFilters.paramX == res[i].pcode) {
              if (graphFilters.methodsX == res[i].mcode) {
                tempResultsX.push(res[i]);
              }
            }
          }
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
          this.graphPointsXSubject.next(valuesX);
          this.graphPointsYSubject.next(valuesY);
          this.allGraphDataYSubject.next(allDataY);
          this.allGraphDataXSubject.next(allDataX);
          this.sidSubject.next(sid);
        }

        base.classList.remove('initial-loader');
      });
  }

  public filterGraphPointsXX(options: {
    paramX: string;
    methodsX: [];
    paramY: string;
    methodsY: [];
  }) {
    let base = document.getElementById('base');
    base.classList.add('initial-loader');
    this.graphPointsXSubject.next(undefined);
    this.graphPointsYSubject.next(undefined);
    let tempResultsX = [];
    let tempResultsY = [];
    let resultsX = [];
    let resultsY = [];
    let valuesX = [];
    let valuesY = [];
    let allDataX = [];
    let allDataY = [];
    let sid = [];
    const url =
      APP_SETTINGS.wqPoints +
      '/?minlat=' +
      -90 +
      '&maxlat=' +
      90 +
      '&minlong=' +
      -180 +
      '&maxlong=' +
      180;
    return this.httpClient.get(url).subscribe((res: any[]) => {
      if (res.length === 0) {
        this.snackBar.open('No points match your query.', 'OK', {
          duration: 4000,
          verticalPosition: 'top',
        });
      } else {
        for (let i = 0; i < res.length; i++) {
          if (options.paramY == res[i].pcode) {
            if (options.methodsY == res[i].mcode) {
              tempResultsY.push(res[i]);
            }
          }
          if (options.paramX == res[i].pcode) {
            if (options.methodsX == res[i].mcode) {
              tempResultsX.push(res[i]);
            }
          }
        }
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
        this.graphPointsXSubject.next(valuesX);
        this.graphPointsYSubject.next(valuesY);
        this.allGraphDataYSubject.next(allDataY);
        this.allGraphDataXSubject.next(allDataX);
        this.sidSubject.next(sid);
      }

      base.classList.remove('initial-loader');
    });
  }

  public filterGraphPointsXXXX(options: {
    paramX: string;
    methodsX: [];
    paramY: string;
    methodsY: [];
  }) {
    let testJSON2 = {
      meta: {
        north: 0,
        south: 0,
        east: 0,
        west: 0,
        min_year: 1776,
        max_year: 2021,
        include_NULL: false,
        satellite_align: false,
      },
      items: {
        P70: 'M59',
        P17: 'M6',
      },
    };

    return this.httpClient
      .post('http://127.0.0.1:5005/json_query', testJSON2)
      .subscribe((res: any[]) => {
        console.log('test results', res);
      });
  }
}
