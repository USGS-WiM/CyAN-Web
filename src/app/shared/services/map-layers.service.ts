import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { APP_SETTINGS } from 'src/app/app.settings';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as L from 'leaflet';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class MapLayersService {
  public wqPointList;
  mapWQSites = L.featureGroup([]);
  constructor(private httpClient: HttpClient, public snackBar: MatSnackBar) {}

  //Basemap Display
  //Add basemap
  public basemapSubject = new BehaviorSubject<any>(undefined);
  basemap$ = this.basemapSubject.asObservable();

  public getBasemap(base) {
    this.basemapSubject.next(base);
  }

  //Remove basemap
  public removeBasemapSubject = new BehaviorSubject<any>(undefined);
  removeBasemap$ = this.removeBasemapSubject.asObservable();

  public removeBasemap(base) {
    this.removeBasemapSubject.next(base);
  }

  public filterWqSampleSubject = new BehaviorSubject<any>(undefined);
  filterWqSample$ = this.filterWqSampleSubject.asObservable();

  //Filter water quality sample points
  public filterWqSample(
    showPoints: Boolean,
    options: { north: number; south: number; east: number; west: number }
  ) {
    this.mapWQSites = L.featureGroup([]);
    this.filterWqSampleSubject.next(this.mapWQSites);
    if (showPoints) {
      this.wqPointList = APP_SETTINGS.wqPoints;
      for (let site of this.wqPointList) {
        let lat = Number(site.latitude);
        let lng = Number(site.longitude);
        if (isNaN(options.south) || lat > options.south) {
          if (isNaN(options.north) || lat < options.north) {
            if (isNaN(options.east) || lng < options.east) {
              if (isNaN(options.west) || lng > options.west) {
                L.marker([lat, lng], {
                  icon: L.divIcon({
                    className: 'wqMapIcon',
                  }),
                }).addTo(this.mapWQSites);
              }
            }
          }
        }
      }
      this.filterWqSampleSubject.next(this.mapWQSites);
    }
  }

  //Filter water quality sample points
  /*
  public filterWqSample2(
    showPoints: Boolean,
    options: { north: number; south: number; east: number; west: number }
  ): Observable<any> {
    console.log('made it');
    this.mapWQSites = L.featureGroup([]);
    this.filterWqSampleSubject.next(this.mapWQSites);
    if (showPoints) {
      this.filterWqSampleSubject.next(this.mapWQSites);
      return this.httpClient
        .get(
          APP_SETTINGS.wqPoints2 +
            '?minlat=' +
            options.south +
            '&maxlat=' +
            options.north +
            '&minlong=' +
            options.west +
            '&maxlong=' +
            options.east
        )
        .pipe(
          tap((response) => {
            console.log('sites received', response);
            return response;
          }),
          catchError(this.handleError<any>('filterWqSample2', []))
        );
    }
  } */

  //Filter water quality sample points
  public filterWqSample3(
    showPoints: Boolean,
    options: {
      north: number;
      south: number;
      east: number;
      west: number;
      pcode: [];
      mcode: [];
      minYear: number;
      maxYear: number;
    }
  ) {
    this.mapWQSites = L.featureGroup([]);
    this.filterWqSampleSubject.next(this.mapWQSites);
    if (showPoints) {
      this.wqPointList = APP_SETTINGS.wqPoints;
      for (let site of this.wqPointList) {
        let lat = Number(site.latitude);
        let lng = Number(site.longitude);
        //if one of the bounding parameters is left blank, set parameter to maximum distance as to not constrain the data in that direction
        if (isNaN(options.south)) {
          options.south = -90;
        }
        if (isNaN(options.north)) {
          options.north = 90;
        }
        if (isNaN(options.east)) {
          options.east = 180;
        }
        if (isNaN(options.west)) {
          options.west = -180;
        }
        if (lat > options.south) {
          if (lat < options.north) {
            if (lng < options.east) {
              if (lng > options.west) {
                L.marker([lat, lng], {
                  icon: L.divIcon({
                    className: 'wqMapIcon',
                  }),
                }).addTo(this.mapWQSites);
              }
            }
          }
        }
      }
      this.filterWqSampleSubject.next(this.mapWQSites);
    }
  }

  public filterWqSample2_TEST(): Subscription {
    const url =
      'http://127.0.0.1:5003/pcode_by_loci/?minlat=31.466153715024294&maxlat=47.279229002570844&minlong=-137.15332031250003&maxlong=-60.02929687500001';
    return this.httpClient.get(url).subscribe((res) => {});
  }

  public filterWqSample2_TEST2(options: {
    north: number;
    south: number;
    east: number;
    west: number;
    pcode: [];
    mcode: [];
    minYear: number;
    maxYear: number;
  }): Subscription {
    if (isNaN(options.south)) {
      options.south = -90;
    }
    if (isNaN(options.north)) {
      options.north = 90;
    }
    if (isNaN(options.east)) {
      options.east = 180;
    }
    if (isNaN(options.west)) {
      options.west = -180;
    }
    const url =
      'http://127.0.0.1:5003/pcode_by_loci/?minlat=' +
      options.south +
      '&maxlat=' +
      options.north +
      '&minlong=' +
      options.west +
      '&maxlong=' +
      options.east;
    return this.httpClient.get(url).subscribe((res: any[]) => {
      // for (let i = 0; i < res.length; i++) {
      for (let i = 0; i < 10; i++) {
        let lat = Number(res[i].latitude);
        let lng = Number(res[i].longitude);
        L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'wqMapIcon',
          }),
        }).addTo(this.mapWQSites);
      }
      this.filterWqSampleSubject.next(this.mapWQSites);
    });
  }

  public filterWqSample2_TEST3(options: {
    north: number;
    south: number;
    east: number;
    west: number;
    pcode: [];
    mcode: [];
    minYear: number;
    maxYear: number;
  }): Subscription {
    this.mapWQSites = L.featureGroup([]);
    this.filterWqSampleSubject.next(this.mapWQSites);
    if (isNaN(options.south)) {
      options.south = -90;
    }
    if (isNaN(options.north)) {
      options.north = 90;
    }
    if (isNaN(options.east)) {
      options.east = 180;
    }
    if (isNaN(options.west)) {
      options.west = -180;
    }
    const url =
      'http://127.0.0.1:5003/pcode_by_loci/?minlat=' +
      options.south +
      '&maxlat=' +
      options.north +
      '&minlong=' +
      options.west +
      '&maxlong=' +
      options.east;
    return this.httpClient.get(url).subscribe((res: any[]) => {
      if (res.length === 0) {
        this.snackBar.open('No sites match your query.', 'OK', {
          duration: 4000,
          verticalPosition: 'top',
        });
      } else {
        //for (let i = 0; i < res.length; i++) {
        //taking too long, so limit to the first 10 for now
        for (let i = 0; i < 10; i++) {
          let date = res[i].date_time_group;
          let formattedDate = Number(moment(date).format('YYYY'));
          if (options.minYear <= formattedDate) {
            if (options.maxYear >= formattedDate) {
              let lat = Number(res[i].latitude);
              let lng = Number(res[i].longitude);
              L.marker([lat, lng], {
                icon: L.divIcon({
                  className: 'wqMapIcon',
                }),
              }).addTo(this.mapWQSites);
            }
          }
        }
      }
      this.filterWqSampleSubject.next(this.mapWQSites);
    });
  }

  public getWqSample() {
    return this.mapWQSites;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
