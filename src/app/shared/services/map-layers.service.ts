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
  // Markers for All Sites Layers
  public mapWQSites = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40,
    iconCreateFunction: function (cluster) {
      var markers = cluster.getAllChildMarkers();
      var html =
        '<div style="text-align: center; margin-top: 7px; color: gray">' +
        markers.length +
        '</div>';
      return L.divIcon({
        html: html,
        className: 'allSiteIcon',
        iconSize: L.point(32, 32),
      });
    },
  });
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

  public filterWqSampleXXX(options: {
    north: number;
    south: number;
    east: number;
    west: number;
    pcode: [];
    mcode: [];
    minYear: number;
    maxYear: number;
    includeNull: Boolean;
    satelliteAlign: Boolean;
  }): Subscription {
    //remove previous points from map
    this.filterWqSampleSubject.next(undefined);
    //reset the sites layer
    this.mapWQSites = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      iconCreateFunction: function (cluster) {
        var markers = cluster.getAllChildMarkers();
        var html =
          '<div style="text-align: center; margin-top: 7px; color: gray">' +
          markers.length +
          '</div>';
        return L.divIcon({
          html: html,
          className: 'allSiteIcon',
          iconSize: L.point(32, 32),
        });
      },
    });
    //if one of the bounding boxes is blank, don't constrain the query in that direction
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
    let base = document.getElementById('base');
    base.classList.add('initial-loader');
    ///////////////// Update this later to use url base from app.settings.ts ////////////////////////////
    const url =
      APP_SETTINGS.wqPoints +
      '/?minlat=' +
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
        for (let i = 0; i < res.length; i++) {
          //taking too long, so limit to the first 10 for now
          // for (let i = 0; i < 1000; i++) {
          let date = res[i].date_time_group;
          let formattedDate = Number(moment(date).format('YYYY'));
          if (options.minYear <= formattedDate) {
            if (options.maxYear >= formattedDate) {
              let lat = Number(res[i].latitude);
              let lng = Number(res[i].longitude);
              L.marker([lat, lng], {
                icon: L.divIcon({
                  className: 'allSiteIcon',
                }),
              }).addTo(this.mapWQSites);
            }
          }
        }
        this.filterWqSampleSubject.next(this.mapWQSites);
        base.classList.remove('initial-loader');
      }
    });
  }

  public filterWqSample(options: {
    north: number;
    south: number;
    east: number;
    west: number;
    pcode: [];
    mcode: [];
    minYear: number;
    maxYear: number;
    includeNull: Boolean;
    satelliteAlign: Boolean;
  }) {
    console.log('entering filterGraphPts');

    let testJSON2 = {
      meta: {
        north: 49,
        south: 38,
        east: -74,
        west: -95,
        min_year: 2013,
        max_year: 2014,
        include_NULL: false,
        satellite_align: false,
      },
      items: {
        P101: ['M89', 'M90'],
        P409: ['M398'],
      },
    };

    return this.httpClient
      .post('http://127.0.0.1:5005/json_query', testJSON2)
      .subscribe((res: any[]) => {
        console.log('test results', res);
      });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
