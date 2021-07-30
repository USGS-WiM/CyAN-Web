import { Component, OnInit } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-options',
  templateUrl: './map-options.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class MapOptionsComponent implements OnInit {
  public mapForm: FormGroup;
  public mapFilters: Boolean = true;
  public mapLayerOptions: Boolean = true;
  public northBounds: number;
  public southBounds: number;
  public eastBounds: number;
  public westBounds: number;
  public mapBoundsChecked: Boolean = false;
  public osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 18,
      minZoom: 3,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  );
  public grayscale = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    }
  );
  public imagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    }
  );
  minValue: number = 1975;
  maxValue: number = 2021;
  timeOptions: Options = {
    floor: 1975,
    ceil: 2021,
    animate: false,
    barDimension: 230,
  };

  Parameters = new FormControl();
  parameterList: string[] = [
    'Phosphorus',
    'Dissolved Oxygen',
    'pH',
    'Nitrogen',
    'Chloride',
  ];

  Methods = new FormControl();
  methodsList: string[] = [
    'Method 1',
    'Method 2',
    'Method 3',
    'Method 4',
    'Method 5',
  ];

  States = new FormControl();
  stateList: string[] = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'District of Columbia',
    'Federated States of Micronesia',
    'Florida',
    'Georgia',
    'Guam',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Marshall Islands',
  ];

  constructor(
    private formBuilder: FormBuilder,
    private componentDisplayService: ComponentDisplayService
  ) {
    /* formBuilder.group({
      baseControl: null,
      northControl: Number,
    }); */
  }

  ngOnInit(): void {
    this.mapForm = new FormGroup({
      northControl: new FormControl(),
      southControl: new FormControl(),
      eastControl: new FormControl(),
      westControl: new FormControl(),
    });

    this.resizeDivs();
    window.addEventListener('resize', function () {
      let windowHeight = window.innerHeight;
      console.log('windowHeight', windowHeight);
      let mapPointFilterDiv = document.getElementById('mapOptionsContainer');
      let mapLayersRadioLabels = document.getElementById('mapLayersID');
      let mapLayersRadioBtns = document.getElementById('mapLayerRadioBtns');
      let radioCheckmarkOuter = document.getElementById('radioCheckmarkOuter');
      if (windowHeight < 788) {
        mapPointFilterDiv.classList.remove('optionsBackgroundMapFull');
        mapPointFilterDiv.classList.add('optionsBackgroundMapResize');
      }

      if (windowHeight > 788) {
        mapPointFilterDiv.classList.add('optionsBackgroundMapFull');
        mapPointFilterDiv.classList.remove('optionsBackgroundMapResize');
      }
      if (windowHeight < 530) {
        console.log('tiny height');

        mapLayersRadioLabels.classList.remove('mapLayers');
        mapLayersRadioLabels.classList.add('mapLayersResize');

        mapLayersRadioBtns.classList.remove('radioContainer');
        mapLayersRadioBtns.classList.add('radioContainerResize');

        radioCheckmarkOuter.classList.remove('radioCheckmark');
        radioCheckmarkOuter.classList.add('radioCheckmarkResize');
        console.log('mapLayersRadio.classList', mapLayersRadioLabels.classList);
      }
      if (windowHeight > 530) {
        mapLayersRadioLabels.classList.add('mapLayers');
        mapLayersRadioLabels.classList.remove('mapLayersResize');

        mapLayersRadioBtns.classList.add('radioContainer');
        mapLayersRadioBtns.classList.remove('radioContainerResize');

        radioCheckmarkOuter.classList.add('radioCheckmark');
        radioCheckmarkOuter.classList.remove('radioCheckmarkResize');

        console.log('mapLayersRadio.classList', mapLayersRadioLabels.classList);
      }
    });
  }

  public displayMapFilters(display: Boolean) {
    this.mapFilters = display;
  }

  public displayMapLayerOptions(display: Boolean) {
    this.mapLayerOptions = display;
  }

  public changeBasemap(selectedBasemap: string) {
    if (selectedBasemap === 'streets') {
      console.log('streets selected');
    }
    if (selectedBasemap === 'imagery') {
      console.log('imagery selected');
    }
    if (selectedBasemap === 'grayscale') {
      console.log('gray selected');
    }
  }

  public resizeDivs() {
    let windowHeight = window.innerHeight;
    console.log('windowHeight', windowHeight);
    let mapPointFilterDiv = document.getElementById('mapOptionsContainer');
    if (windowHeight < 788) {
      mapPointFilterDiv.classList.remove('optionsBackgroundMapFull');
      mapPointFilterDiv.classList.add('optionsBackgroundMapResize');
    }

    if (windowHeight > 788) {
      mapPointFilterDiv.classList.add('optionsBackgroundMapFull');
      mapPointFilterDiv.classList.remove('optionsBackgroundMapResize');
    }
    if (windowHeight < 150) {
      console.log('super small');
    }
  }

  public populateMapBounds(boundsChecked: MatCheckboxChange) {
    if (boundsChecked.checked) {
      this.componentDisplayService.northBoundsSubject.subscribe((lat) => {
        if (lat && boundsChecked.checked) {
          this.northBounds = lat;
        }
      });
      this.componentDisplayService.southBoundsSubject.subscribe((lat) => {
        if (lat) {
          this.southBounds = lat;
        }
      });
      this.componentDisplayService.eastBoundsSubject.subscribe((lng) => {
        if (lng) {
          this.eastBounds = lng;
        }
      });
      this.componentDisplayService.westBoundsSubject.subscribe((lng) => {
        if (lng) {
          this.westBounds = lng;
        }
      });

      this.mapForm.get('northControl').setValue(this.northBounds);
      this.mapForm.get('southControl').setValue(this.southBounds);
      this.mapForm.get('eastControl').setValue(this.eastBounds);
      this.mapForm.get('westControl').setValue(this.westBounds);
    }
    if (!boundsChecked.checked) {
      let testVal: number;
      this.mapForm.get('northControl').setValue(testVal);
      this.mapForm.get('southControl').setValue('');
      this.mapForm.get('eastControl').setValue('');
      this.mapForm.get('westControl').setValue('');
    }
  }

  public newBasemap() {
    let streetRadioBtn = document.getElementById(
      'streetRadio'
    ) as HTMLInputElement;
    let imageryRadioBtn = document.getElementById(
      'imageryRadio'
    ) as HTMLInputElement;
    let grayscaleRadioBtn = document.getElementById(
      'grayscaleRadio'
    ) as HTMLInputElement;
    if (streetRadioBtn.checked) {
      this.componentDisplayService.getBasemap(this.osm);
      this.componentDisplayService.removeBasemap(this.imagery);
      this.componentDisplayService.removeBasemap(this.grayscale);
    }
    if (imageryRadioBtn.checked) {
      this.componentDisplayService.getBasemap(this.imagery);
      this.componentDisplayService.removeBasemap(this.osm);
      this.componentDisplayService.removeBasemap(this.grayscale);
    }
    if (grayscaleRadioBtn.checked) {
      this.componentDisplayService.getBasemap(this.grayscale);
      this.componentDisplayService.removeBasemap(this.imagery);
      this.componentDisplayService.removeBasemap(this.osm);
    }
  }
}
