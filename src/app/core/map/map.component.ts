import { Component, AfterViewInit } from '@angular/core';
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
    this.mapLayersService.filterWqSampleSubject.subscribe((points) => {
      if (points) {
        if (points._leaflet_id) {
          if (this.currentPoints) {
            this.currentPoints.removeFrom(this.map);
          }
          this.currentPoints = points;
          this.currentPoints.addTo(this.map);
          this.zoomToPoints(points);
        }
      }
    });
  }

  private zoomToPoints(layer) {
    this.map.fitBounds(layer.getBounds());
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [39.8282, -98.5795],
      zoom: 5,
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
}
