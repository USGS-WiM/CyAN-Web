import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { APP_SETTINGS } from 'src/app/app.settings';
import * as L from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class MapLayersService {
  public wqPointList;
  mapWQSites = L.featureGroup([]);
  constructor() {}

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

  public getWqSample() {
    return this.mapWQSites;
  }
}
