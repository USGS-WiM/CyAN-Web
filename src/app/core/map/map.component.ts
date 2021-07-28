import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private map;
  public northBounds: number;
  public southBounds: number;
  public eastBounds: number;
  public westBounds: number;

  constructor(private componentDisplayService: ComponentDisplayService) {}

  ngOnInit(): void {
    this.initMap();
    this.componentDisplayService.basemapSubject.subscribe((base) => {
      if (base) {
        base.addTo(this.map);
      }
    });
    this.componentDisplayService.removeBasemapSubject.subscribe((base) => {
      if (base) {
        base.removeFrom(this.map);
      }
    });
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
        this.componentDisplayService.basemapSubject.subscribe((base) => {
          if (base) {
            base.addTo(this.map);
            console.log('base', base);
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
