import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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

  public flagIndexX = new BehaviorSubject<any>(undefined);
  flagIndexX$ = this.flagIndexX.asObservable();

  public flagIndexY = new BehaviorSubject<any>(undefined);
  flagIndexY$ = this.flagIndexY.asObservable();

  public minDateSubject = new BehaviorSubject<any>(undefined);
  minDateY$ = this.minDateSubject.asObservable();

  public maxDateSubject = new BehaviorSubject<any>(undefined);
  maxDateX$ = this.maxDateSubject.asObservable();

  public xAxisUnitsSubject = new BehaviorSubject<any>(undefined);
  xAxisUnitsSubject$ = this.xAxisUnitsSubject.asObservable();

  public yAxisUnitsSubject = new BehaviorSubject<any>(undefined);
  yAxisUnitsSubject$ = this.yAxisUnitsSubject.asObservable();

  public colorsSubject = new BehaviorSubject<any>(undefined);
  colorsSubject$ = this.colorsSubject.asObservable();

  public symbolsSubject = new BehaviorSubject<any>(undefined);
  symbolsSubject$ = this.symbolsSubject.asObservable();

  public updateFlags(flags) {
    this.flagsSubject.next(flags);
  }

  private subject = new Subject<any>();
  sendFlagConfirmClickEvent() {
    this.subject.next();
  }
  getFlagConfirmClickEvent(): Observable<any> {
    return this.subject.asObservable();
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

  //Colors for all 4 flagging options
  public pointColors: Array<String> = [];
  public unflaggedColor: string = 'rgba(242, 204, 177, 0.2)';
  public xyFlaggedColor: string = 'rgb(17, 119, 51)';
  public xFlaggedColor: string = 'rgb(136, 204, 238)';
  public yFlaggedColor: string = 'rgb(170, 68, 153)';
  public pointBorderColor: string = 'rgba(242, 204, 177, 1)';
  public flaggedBorderWidth: number = 0;
  public unflaggedBorderWidth: number = 2;
  public flaggedSize: number = 13;
  public unflaggedSize: number = 16;
  public allBorderWidths: Array<Number> = [];
  public allSizes: Array<Number> = [];
  //Symbols for flagged vs unflagged
  public pointSymbol: Array<String> = [];
  public unflaggedSymbol: string = 'circle';
  public flaggedSymbol: string = 'circle';
  public xySymbol: string = 'cross';
  public xSymbol: string = 'triangle-up';
  public ySymbol: string = 'square';

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
        organization: number;
      };
      items;
    },
    axis: string
  ) {
    return this.httpClient
      .post(APP_SETTINGS.wqDataURL, graphFilters)
      .subscribe((res: any[]) => {
        if (res.length === 0) {
          this.noDataMatchQuery();
          this.ready = 0;
        } else {
          if (axis === 'xAxis') {
            //store raw results for x axis
            this.rawX = res;
            this.tempResultsXSubject.next(res);
            this.ready += 1;
          }
          if (axis === 'yAxis') {
            //store raw results for y axis
            this.rawY = res;
            this.tempResultsYSubject.next(res);
            this.ready += 1;
          }
          //when results have been saved for both x and y axis, proceed to filtering points
          if (this.ready == 2) {
            this.ready = 0;
            this.filterGraphPoints(this.rawX, this.rawY);
          }
        }
      });
  }

  //get min and max dates and units for each axis
  public formatMetadata(res, axis) {
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

        //get units
        //this is for metadata csv and axes labels
        if (axis == 'yAxis') {
          this.yAxisUnitsSubject.next(res[0].units);
        }
        if (axis == 'xAxis') {
          this.xAxisUnitsSubject.next(res[0].units);
        }
      }
    }
  }

  //Match x data with y data and use them to populate graph
  public filterGraphPoints(tempResultsX, tempResultsY) {
    this.graphPointsXSubject.next(undefined);
    this.graphPointsYSubject.next(undefined);
    this.valuesX = [];
    this.valuesY = [];
    this.allDataX = [];
    this.allDataY = [];
    this.pointColors = [];
    this.pointSymbol = [];
    this.allBorderWidths = [];
    this.allSizes = [];
    this.sid = [];
    let flagX = [];
    let flagY = [];
    let counter = 0;
    if (tempResultsX && tempResultsY) {
      for (
        let xResultsIndex = 0;
        xResultsIndex < tempResultsX.length;
        xResultsIndex++
      ) {
        for (
          let yResultsIndex = 0;
          yResultsIndex < tempResultsY.length;
          yResultsIndex++
        ) {
          if (
            //Matches are based on sid. One value for an sid for each axis = 1 point on the graph
            tempResultsY[yResultsIndex].sid == tempResultsX[xResultsIndex].sid
          ) {
            counter += 1;
            let xFlag: Boolean = false;
            let yFlag: Boolean = false;
            if (this.flagsSubject.value) {
              for (
                let flagIndex = 0;
                flagIndex < this.flagsSubject.value.length;
                flagIndex++
              ) {
                if (
                  this.flagsSubject.value[flagIndex].rcode ==
                  tempResultsX[xResultsIndex].rcode
                ) {
                  flagX.push(xResultsIndex);
                  xFlag = true;
                }
                if (
                  this.flagsSubject.value[flagIndex].rcode ==
                  tempResultsY[yResultsIndex].rcode
                ) {
                  flagY.push(yResultsIndex);
                  yFlag = true;
                }
              }
            }

            this.assignColors(xFlag, yFlag);
            this.valuesX.push(tempResultsX[xResultsIndex].result);
            this.valuesY.push(tempResultsY[yResultsIndex].result);
            this.allDataX.push(tempResultsX[xResultsIndex]);
            this.allDataY.push(tempResultsY[yResultsIndex]);
            this.sid.push(tempResultsY[yResultsIndex].sid);
          }
          if (
            yResultsIndex > tempResultsY.length - 2 &&
            xResultsIndex > tempResultsX.length - 2
          ) {
            this.formatMetadata(this.allDataX, 'xAxis');
            this.formatMetadata(this.allDataY, 'yAxis');
            this.flagIndexX.next(flagX);
            this.flagIndexY.next(flagY);
            this.finalGraphValues();
          }
        }
      }
    } else {
      this.noDataMatchQuery();
    }
  }

  //When a new graph is generated, assign colors and symbols for each point
  public assignColors(xFlag: Boolean, yFlag: Boolean) {
    //Add an x flag marker to the color and symbol arrays
    if (xFlag == true && yFlag == false) {
      this.pointColors.push(this.xFlaggedColor);
      this.pointSymbol.push(this.xSymbol);
      this.allBorderWidths.push(this.flaggedBorderWidth);
      this.allSizes.push(this.flaggedSize);
      //Add a y flag marker to the color and symbol arrays
    } else if (xFlag == false && yFlag == true) {
      this.pointColors.push(this.yFlaggedColor);
      this.pointSymbol.push(this.ySymbol);
      this.allBorderWidths.push(this.flaggedBorderWidth);
      this.allSizes.push(this.flaggedSize);
      //Add an xy flag marker to the color and symbol arrays
    } else if (xFlag == true && yFlag == true) {
      this.pointColors.push(this.xyFlaggedColor);
      this.pointSymbol.push(this.xySymbol);
      this.allBorderWidths.push(this.flaggedBorderWidth);
      this.allSizes.push(this.flaggedSize);
      //No flags; add a default marker to the color and symbol arrays
    } else {
      this.pointColors.push(this.unflaggedColor);
      this.pointSymbol.push(this.unflaggedSymbol);
      this.allBorderWidths.push(this.unflaggedBorderWidth);
      this.allSizes.push(this.unflaggedSize);
    }
  }

  public noDataMatchQuery() {
    this.snackBar.open('No data are available for your query.', 'OK', {
      duration: 4000,
      verticalPosition: 'top',
    });
    let base = document.getElementById('base');
    base.classList.remove('initial-loader');
    let graphOptionsBackgroundID = document.getElementById(
      'graphOptionsBackgroundID'
    );
    graphOptionsBackgroundID.classList.remove('disableClick');
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
      let base = document.getElementById('base');
      base.classList.remove('initial-loader');
    }
  }
}
