import { Injectable } from '@angular/core';
declare let L: any;
import 'leaflet';
import 'leaflet.markercluster';

//import * as L from 'leaflet';

@Injectable({
  providedIn: 'root',
})
export class MarkersService {
  public mapWQSites = new L.markerClusterGroup({
    /* showCoverageOnHover: false,
    maxClusterRadius: 40,
    iconCreateFunction: function (cluster) {
      var markers = cluster.getAllChildMarkers();
      var html =
        '<div style="text-align: center; margin-top: 7px; color: white">' +
        markers.length +
        '</div>';
      return L.divIcon({
        html: html,
        className: 'allSiteIcon',
        iconSize: L.point(32, 32),
      });
    }, */
  });

  public testMarkers() {
    L.marker([44.94147335480253, -78.25012207031251], {
      iconSize: 32,
    }).addTo(this.mapWQSites);
  }

  constructor() {}
}
