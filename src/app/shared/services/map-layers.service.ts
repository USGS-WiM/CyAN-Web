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

    let mapDataObject = [];
    let mapData;

    this.mapWQSites.on('clusterclick', (cluster) => {
      setTimeout(() => {
        //Created this timeout because otherwise it returns the data of the full screen before it zooms to the clicked point
        //Should probably create some variable (observable?) and an observable at the zoomend thing where if they're both true, then teh following code is triggered
        //Still need to create a popup
        let northCoords;
        let southCoords;
        let eastCoords;
        let westCoords;
        this.componentDisplayService.northBoundsSubject.subscribe(
          (coord: number) => (northCoords = coord)
        );
        this.componentDisplayService.southBoundsSubject.subscribe(
          (coord: number) => (southCoords = coord)
        );
        this.componentDisplayService.eastBoundsSubject.subscribe(
          (coord: number) => (eastCoords = coord)
        );
        this.componentDisplayService.westBoundsSubject.subscribe(
          (coord: number) => (westCoords = coord)
        );
        let matchingPoints = [];
        let resultValues = [];
        let pCodes = [];
        let mCodes = [];
        let totalSamples = mapData.length;
        for (let i = 0; i < mapData.length; i++) {
          let lat = Number(mapData[i].latitude);
          let lng = Number(mapData[i].longitude);
          if (
            lng > westCoords &&
            lng < eastCoords &&
            lat < northCoords &&
            lat > southCoords
          ) {
            matchingPoints.push(mapData[i]);
            pCodes.push(mapData[i].pcode);
          }
        }
        pCodes.sort();
        let pCodeSummary = [];
        let tempCode;
        let count = 0;
        for (let i = 0; i < pCodes.length; i++) {
          if (pCodes[i] !== tempCode) {
            if (i === 0) {
              console.log('first round');
              count = 1;
            }
            if (i !== 0) {
              pCodeSummary.push({ pCode: tempCode, count: count });
              count = 0;
            }
          }
          if (i === pCodes.length - 1) {
            pCodeSummary.push({ pCode: tempCode, count: count });
          }

          tempCode = pCodes[i];
          count += 1;
        }
        console.log('matchingPoints', matchingPoints);
        console.log('pCodeSummary', pCodeSummary);
      }, 1000);
    });
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

            let tempMapData = new Object();
            tempMapData['lat'] = res[i].latitude;
            tempMapData['lng'] = res[i].longitude;

            mapDataObject.push(tempMapData);

            L.marker([lat, lng], {
              icon: L.divIcon({
                className: 'allSiteIcon',
              }),
            }).addTo(this.mapWQSites);
          }
          console.log('mapDataObject', mapDataObject);
          this.filterWqSampleSubject.next(this.mapWQSites);
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
