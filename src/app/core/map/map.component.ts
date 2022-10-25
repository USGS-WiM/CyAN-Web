import { Component, AfterViewInit, HostListener } from '@angular/core';
import * as L from 'leaflet';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';
import { MapLayersService } from 'src/app/shared/services/map-layers.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {
  private map;
  public northBounds: number;
  public southBounds: number;
  public eastBounds: number;
  public westBounds: number;
  public currentPoints;
  public latitude: number;
  public longitude: number;

  constructor(
    private componentDisplayService: ComponentDisplayService,
    private mapLayersService: MapLayersService
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.mapLayersService.basemapSubject.subscribe((base) => {
      if (base) {
        base.addTo(this.map);
      }
    });
    this.mapLayersService.removeBasemapSubject.subscribe((base) => {
      if (base) {
        base.removeFrom(this.map);
      }
    });
    this.mapLayersService.getClearMapClickEvent().subscribe(() => {
      this.clearMap();
    });
    this.mapLayersService.filterWqSampleSubject.subscribe((points) => {
        this.mapLayersService.mapQueryResultsSubject.subscribe(
          (mapQueryResults) => {
            if (this.currentPoints) {
              this.currentPoints.removeFrom(this.map);
            }
            if (points) {
              if (points._leaflet_id) {
                this.currentPoints = points;
                this.currentPoints.addTo(this.map);
  
                this.zoomToPoints(points);
                this.currentPoints.on('clusterclick', (cluster) => {
                  setTimeout(() => {
                    if (mapQueryResults) {
                      //Created this timeout because otherwise it returns the data of the full screen before it zooms to the clicked point
                      //Should probably create some variable (observable?) and an observable at the zoomend thing where if they're both true, then the following code is triggered to remove timeout
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
                      let pCodes = [];
  
                      for (let i = 0; i < mapQueryResults.length; i++) {
                        let lat = Number(mapQueryResults[i].latitude);
                        let lng = Number(mapQueryResults[i].longitude);
                        if (
                          lng > westCoords &&
                          lng < eastCoords &&
                          lat < northCoords &&
                          lat > southCoords
                        ) {
                          matchingPoints.push(mapQueryResults[i]);
                          pCodes.push(mapQueryResults[i].pcode);
                        }
                      }
                      pCodes.sort();
                      let pCodeSummary = [];
                      let tempCode;
                      let count = 0;
                      for (let i = 0; i < pCodes.length; i++) {
                        if (pCodes[i] !== tempCode) {
                          if (i === 0) {
                            count = 1;
                          }
                          if (i !== 0) {
                            pCodeSummary.push({
                              pCode: tempCode,
                              count: count,
                              result: 0,
                            });
                            count = 0;
                          }
                        }
                        if (i === pCodes.length - 1) {
                          pCodeSummary.push({
                            pCode: tempCode,
                            count: count,
                            result: 0,
                          });
                        }
  
                        tempCode = pCodes[i];
                        count += 1;
                      }
                      for (let i = 0; i < pCodeSummary.length; i++) {
                        for (let x = 0; x < matchingPoints.length; x++) {
                          if (pCodeSummary[i].pCode === matchingPoints[x].pcode) {
                            pCodeSummary[i].result =
                              pCodeSummary[i].result + matchingPoints[x].result;
                          }
                        }
                      }
                      let popupContent =
                        '<b> Water Samples </b><br/> <hr> <table> <tr> <th>Parameter &nbsp</th> <th>Quantity &nbsp</th> <th>Mean Value &nbsp</th> </tr>';
                      let totalSamples = matchingPoints.length;
                      for (let i = 0; i < pCodeSummary.length; i++) {
                        popupContent =
                          popupContent +
                          '<tr><td>' +
                          pCodeSummary[i].pCode +
                          '</td><td>' +
                          pCodeSummary[i].count.toString() +
                          '</td><td>' +
                          (
                            Math.round(pCodeSummary[i].result * 100) / 100
                          ).toString() +
                          '</td>';
                        if (i === pCodeSummary.length - 1) {
                          popupContent = popupContent + '</tr></table>';
                        }
                      }
  
                      let centerLatLng = this.map.getCenter();
                      this.map.openPopup(popupContent, centerLatLng, {
                        className: 'custom',
                      });
                    }
                  }, 1000);
                });
              }
            }
          }
        );  
    });

    L.control.scale({ position: 'bottomright' }).addTo(this.map);
    this.map.whenReady(() => {
      const initMapCenter = this.map.getCenter();
      this.latitude = initMapCenter.lat.toFixed(4);
      this.longitude = initMapCenter.lng.toFixed(4);
    });
  }

  private zoomToPoints(layer) {
    this.map.fitBounds(layer.getBounds());
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [45.2, -85.62],
      zoom: 7,
      zoomControl: false,
    });
    this.getMapBoundingBox();
    this.map.on('moveend', () => {
      if (this.map) {
        this.getMapBoundingBox();
        this.mapLayersService.basemapSubject.subscribe((base) => {
          if (base) {
            base.addTo(this.map);
          }
        });
      }
    });
    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 18,
        minZoom: 3,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    );
    tiles.addTo(this.map);
    this.componentDisplayService.getDisableMap(true);
    this.disableMap();
  }
  private clearMap() {
      this.mapLayersService.filterWqSample(undefined);

      const startingBounds = [45.2, -85.62];
      this.map.setView(startingBounds, 7);
  }
  private getMapBoundingBox() {
    this.northBounds = this.map.getBounds().getNorth();
    this.southBounds = this.map.getBounds().getSouth();
    this.eastBounds = this.map.getBounds().getEast();
    this.westBounds = this.map.getBounds().getWest();

    this.componentDisplayService.getNorthBounds(this.northBounds);
    this.componentDisplayService.getSouthBounds(this.southBounds);
    this.componentDisplayService.getEastBounds(this.eastBounds);
    this.componentDisplayService.getWestBounds(this.westBounds);
  }
  public disableMap() {
    this.componentDisplayService.disableMapSubject.subscribe((disableMap) => {
      if (disableMap) {
        this.map.dragging.disable();
        this.map.touchZoom.disable();
        this.map.doubleClickZoom.disable();
        this.map.scrollWheelZoom.disable();
        this.map.boxZoom.disable();
        this.map.keyboard.disable();
        if (this.map.tap) this.map.tap.disable();
        document.getElementById('map').style.cursor = 'default';
      } else {
        this.map.dragging.enable();
        this.map.touchZoom.enable();
        this.map.doubleClickZoom.enable();
        this.map.scrollWheelZoom.enable();
        this.map.boxZoom.enable();
        this.map.keyboard.enable();
        if (this.map.tap) this.map.tap.enable();
        document.getElementById('map').style.cursor = 'grab';
      }
    });
  }
}
