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

  public filterGraphPoints(options: {
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
    console.log('options.paramX', options.paramX);
    console.log('options.methodsX', options.methodsX);
    console.log('options.paramY', options.paramY);
    console.log('options.methodsY', options.methodsY);
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
        /*for (let i = 0; i < tempResultsX.length; i++) {
          for (let x = 0; x < tempResultsY.length; x++) {
            if (tempResultsX[i].latitude === tempResultsY[x].latitude) {
              if (tempResultsX[i].longitude === tempResultsY[x].longitude) {
                if (
                  tempResultsX[i].date_time_group ===
                  tempResultsY[x].date_time_group
                ) {
                  resultsX.push(tempResultsX[i].result);
                  resultsY.push(tempResultsY[x].result);
                  // console.log('FOUND A MATCH');
                }
              }
            }
          }
        } */
        for (let i = 0; i < tempResultsX.length; i++) {
          for (let x = 0; x < tempResultsY.length; x++) {
            if (tempResultsY[x].sid == tempResultsX[i].sid) {
              resultsX.push(tempResultsX[i].result);
              resultsY.push(tempResultsY[x].result);
            }
          }
        }
        this.graphPointsXSubject.next(resultsX);
        this.graphPointsYSubject.next(resultsY);
        console.log('X length', tempResultsX.length);
        console.log('Y length', tempResultsY.length);
      }

      base.classList.remove('initial-loader');
    });
  }
}
