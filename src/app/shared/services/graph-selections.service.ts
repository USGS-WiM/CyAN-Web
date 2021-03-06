import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APP_SETTINGS } from 'src/app/app.settings';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

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

  public getTempArraysReadySubject = new BehaviorSubject<any>(undefined);
  getTempArraysReady$ = this.getTempArraysReadySubject.asObservable();

  public makeGraphSubject = new BehaviorSubject<any>(undefined);
  makeGraph$ = this.makeGraphSubject.asObservable();

  public filterGraphPointsDoneSubject = new BehaviorSubject<any>(undefined);
  filterGraphPointsDone$ = this.filterGraphPointsDoneSubject.asObservable();

  public flagsSubject = new BehaviorSubject<any>(undefined);
  flags$ = this.flagsSubject.asObservable();

  public minDateSubject = new BehaviorSubject<any>(undefined);
  minDate$ = this.minDateSubject.asObservable();

  public maxDateSubject = new BehaviorSubject<any>(undefined);
  maxDate$ = this.maxDateSubject.asObservable();

  public updateFlags(flags) {
    this.flagsSubject.next(flags);
  }

  public sidSubject = new BehaviorSubject<any>(undefined);
  sid$ = this.sidSubject.asObservable();

  public ready = 0;
  public makeGraph = false;

  public valuesX = [];
  public valuesY = [];
  public allDataX = [];
  public allDataY = [];

  public rawX;
  public rawY;

  public sid = [];

  //Retrieve x and y data from service
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
        region: any[];
      };
      items;
    },
    axis: string
  ) {
    console.log('graphFilters', graphFilters);
    return this.httpClient
      .post(APP_SETTINGS.wqDataURL, graphFilters)
      .subscribe((res: any[]) => {
        console.log('res', res, 'axis', axis);
        if (res.length === 0) {
          this.snackBar.open('No points match your query.', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
          });
          this.ready = 0;
          let base = document.getElementById('base');
          base.classList.remove('initial-loader');
          let graphOptionsBackgroundID = document.getElementById(
            'graphOptionsBackgroundID'
          );
          graphOptionsBackgroundID.classList.remove('disableClick');
        } else {
          //find the min and max date of the dataset so that it can be included in the graph metadata download
          let minDate;
          let maxDate;
          for (let i = 0; i < res.length; i++) {
            let currentDate = res[i].date_time_group;
            if (i === 0) {
              minDate = currentDate;
              maxDate = currentDate;
            }
            if (currentDate < minDate) {
              minDate = currentDate;
            }
            if (currentDate > maxDate) {
              maxDate = currentDate;
            }
            //on the last iteration, format and save the min and max date
            if (i == res.length - 1) {
              maxDate = moment(maxDate).format('MM-DD-YYYY');
              minDate = moment(minDate).format('MM-DD-YYYY');
              this.maxDateSubject.next(maxDate);
              this.minDateSubject.next(minDate);
            }
          }

          if (axis === 'xAxis') {
            this.rawX = res;
            this.tempResultsXSubject.next(res);
            this.ready += 1;
          }
          if (axis === 'yAxis') {
            this.rawY = res;
            this.tempResultsYSubject.next(res);
            this.ready += 1;
          }
          if (this.ready == 2) {
            this.ready = 0;
            this.filterGraphPoints(this.rawX, this.rawY);
          }
        }
      });
  }

  //Match x data with y data and use them to populate graph
  public filterGraphPoints(tempResultsX, tempResultsY) {
    this.graphPointsXSubject.next(undefined);
    this.graphPointsYSubject.next(undefined);
    this.valuesX = [];
    this.valuesY = [];
    this.allDataX = [];
    this.allDataY = [];
    this.sid = [];
    if (tempResultsX && tempResultsY) {
      for (let i = 0; i < tempResultsX.length; i++) {
        for (let x = 0; x < tempResultsY.length; x++) {
          if (tempResultsY[x].sid == tempResultsX[i].sid) {
            this.valuesX.push(tempResultsX[i].result);
            this.valuesY.push(tempResultsY[x].result);
            this.allDataX.push(tempResultsX[i]);
            this.allDataY.push(tempResultsY[x]);
            this.sid.push(tempResultsY[x].sid);
          }
          if (x > tempResultsY.length - 2 && i > tempResultsX.length - 2) {
            this.finalGraphValues();
          }
        }
      }
    } else {
      this.snackBar.open(
        'No matching sites for your selected parameters.',
        'OK',
        {
          duration: 4000,
          verticalPosition: 'top',
        }
      );
      let base = document.getElementById('base');
      base.classList.remove('initial-loader');
      let graphOptionsBackgroundID = document.getElementById(
        'graphOptionsBackgroundID'
      );
      graphOptionsBackgroundID.classList.remove('disableClick');
    }
  }
  public finalGraphValues() {
    if (this.valuesX.length > 0 && this.valuesY.length > 0) {
      this.graphPointsYSubject.next(this.valuesY);
      this.allGraphDataYSubject.next(this.allDataY);
      this.graphPointsXSubject.next(this.valuesX);
      this.allGraphDataXSubject.next(this.allDataX);
      this.sidSubject.next(this.sid);
      this.makeGraphSubject.next(true);
    } else {
      this.snackBar.open(
        'No matching sites for your selected parameters.',
        'OK',
        {
          duration: 4000,
          verticalPosition: 'top',
        }
      );

      let graphOptions = document.getElementById('graphOptionsBackgroundID');
      graphOptions.classList.remove('disableClick');
    }
  }
}
