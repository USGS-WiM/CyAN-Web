import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as L from 'leaflet';
import { APP_SETTINGS } from '../../app.settings';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';

@Injectable({
  providedIn: 'root',
})
export class MapLayersService {
  public wqPointList;
  // Markers for All Sites Layers
  public mapWQSites;
  constructor(
    private httpClient: HttpClient,
    public snackBar: MatSnackBar,
    public componentDisplayService: ComponentDisplayService
  ) {}

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

  public mapQueryResultsSubject = new BehaviorSubject<any>(undefined);
  mapQueryResults$ = this.mapQueryResultsSubject.asObservable();

  //Get map data from service and populate water quality layer
  public filterWqSample(options: {
    meta: {
      north: number;
      south: number;
      east: number;
      west: number;
      min_year: number;
      max_year: number;
      include_NULL: Boolean;
      satellite_align: Boolean;
      region: any[];
    };
    items: {};
  }) {
    console.log('map query', options);
    this.mapWQSites = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: false,
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

    let mapData;

    let base = document.getElementById('base');
    base.classList.add('initial-loader');

    //if one of the bounding boxes is blank, don't constrain the query in that direction
    if (isNaN(options.meta.south)) {
      options.meta.south = -90;
    }
    if (isNaN(options.meta.north)) {
      options.meta.north = 90;
    }
    if (isNaN(options.meta.east)) {
      options.meta.east = 180;
    }
    if (isNaN(options.meta.west)) {
      options.meta.west = -180;
    }

    return this.httpClient
      .post(APP_SETTINGS.wqDataURL, options)
      .subscribe((res: any[]) => {
        if (res.length === 0) {
          this.snackBar.open('No sites match your query.', 'OK', {
            duration: 4000,
            verticalPosition: 'top',
          });

          base.classList.remove('initial-loader');
        } else {
          mapData = res;
          console.log('map results', res);
          for (let i = 0; i < res.length; i++) {
            let lat = Number(res[i].latitude);
            let lng = Number(res[i].longitude);

            L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'allSiteIcon',
              }),
            }).addTo(this.mapWQSites);
          }
          this.filterWqSampleSubject.next(this.mapWQSites);
          this.mapQueryResultsSubject.next(mapData);
          base.classList.remove('initial-loader');
          let mapDownloadBtn = document.getElementById('mapDownloadBtn');
          mapDownloadBtn.classList.remove('disabledDataBtn');
        }
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
