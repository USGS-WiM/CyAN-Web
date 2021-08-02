import { Component, OnInit, HostListener } from '@angular/core';
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
    barDimension: 210,
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

  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    this.mapForm = new FormGroup({
      northControl: new FormControl(),
      southControl: new FormControl(),
      eastControl: new FormControl(),
      westControl: new FormControl(),
    });

    this.resizeDivs();
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
    let windowWidth = window.innerWidth;
    let mapPointFilterDiv = document.getElementById('mapOptionsContainer');
    let mapLayersRadioLabels = document.getElementById('mapLayersID');
    let mapLayersRadioBtns0 = document.getElementById('radioContainerResize0');
    let radioCheckmarkOuter0 = document.getElementById('radioCheckmarkOuter0');
    let mapLayersRadioBtns1 = document.getElementById('radioContainerResize1');
    let radioCheckmarkOuter1 = document.getElementById('radioCheckmarkOuter1');
    let mapLayersRadioBtns2 = document.getElementById('radioContainerResize2');
    let radioCheckmarkOuter2 = document.getElementById('radioCheckmarkOuter2');
    let mapLayersOptions = document.getElementById('mapLayersOptions');
    let filterPointsCollapsed = document.getElementById(
      'filterPointsCollapsed'
    );
    let mapLayersCollapsed = document.getElementById('mapLayersCollapsed');
    if (windowWidth < 800) {
      mapLayersOptions.classList.remove('marginLeftFullWidth');
      mapLayersOptions.classList.add('marginLeftSmallWidth');

      mapPointFilterDiv.classList.remove('marginLeftFullWidth');
      mapPointFilterDiv.classList.add('marginLeftSmallWidth');

      filterPointsCollapsed.classList.remove('marginLeftFullWidth');
      filterPointsCollapsed.classList.add('marginLeftSmallWidth');

      mapLayersCollapsed.classList.remove('marginLeftFullWidth');
      mapLayersCollapsed.classList.add('marginLeftSmallWidth');
    }
    if (windowWidth > 800) {
      mapLayersOptions.classList.add('marginLeftFullWidth');
      mapLayersOptions.classList.remove('marginLeftSmallWidth');

      mapPointFilterDiv.classList.add('marginLeftFullWidth');
      mapPointFilterDiv.classList.remove('marginLeftSmallWidth');

      filterPointsCollapsed.classList.add('marginLeftFullWidth');
      filterPointsCollapsed.classList.remove('marginLeftSmallWidth');

      mapLayersCollapsed.classList.add('marginLeftFullWidth');
      mapLayersCollapsed.classList.remove('marginLeftSmallWidth');
    }
    if (windowHeight < 788) {
      mapPointFilterDiv.classList.remove('optionsBackgroundMapFull');
      mapPointFilterDiv.classList.add('optionsBackgroundMapResizeH');
    }

    if (windowHeight > 788) {
      mapPointFilterDiv.classList.add('optionsBackgroundMapFull');
      mapPointFilterDiv.classList.remove('optionsBackgroundMapResizeH');
    }
    //Edit map layers box when the height shrinks
    if (windowHeight < 530) {
      //reduce font size
      mapLayersRadioLabels.classList.remove('mapLayers');
      mapLayersRadioLabels.classList.add('mapLayersResize');

      //reduce radio button size
      mapLayersRadioBtns0.classList.remove('radioContainer');
      mapLayersRadioBtns0.classList.add('radioContainerResize');

      radioCheckmarkOuter0.classList.remove('radioCheckmark');
      radioCheckmarkOuter0.classList.add('radioCheckmarkResize');

      mapLayersRadioBtns1.classList.remove('radioContainer');
      mapLayersRadioBtns1.classList.add('radioContainerResize');

      radioCheckmarkOuter1.classList.remove('radioCheckmark');
      radioCheckmarkOuter1.classList.add('radioCheckmarkResize');

      mapLayersRadioBtns2.classList.remove('radioContainer');
      mapLayersRadioBtns2.classList.add('radioContainerResize');

      radioCheckmarkOuter2.classList.remove('radioCheckmark');
      radioCheckmarkOuter2.classList.add('radioCheckmarkResize');

      //reduce spacing between map layers and nav buttons and decrease background height
      mapLayersOptions.classList.remove('mapLayerOptionsBackground');
      mapLayersOptions.classList.add('mapLayerOptionsBackgroundResizeH');
    }
    if (windowHeight > 530) {
      //increase font size
      mapLayersRadioLabels.classList.add('mapLayers');
      mapLayersRadioLabels.classList.remove('mapLayersResize');

      //increase radio button size
      mapLayersRadioBtns0.classList.add('radioContainer');
      mapLayersRadioBtns0.classList.remove('radioContainerResize');

      radioCheckmarkOuter0.classList.add('radioCheckmark');
      radioCheckmarkOuter0.classList.remove('radioCheckmarkResize');

      mapLayersRadioBtns1.classList.add('radioContainer');
      mapLayersRadioBtns1.classList.remove('radioContainerResize');

      radioCheckmarkOuter1.classList.add('radioCheckmark');
      radioCheckmarkOuter1.classList.remove('radioCheckmarkResize');

      mapLayersRadioBtns2.classList.add('radioContainer');
      mapLayersRadioBtns2.classList.remove('radioContainerResize');

      radioCheckmarkOuter2.classList.add('radioCheckmark');
      radioCheckmarkOuter2.classList.remove('radioCheckmarkResize');

      //increase spacing between map layers and nav buttons and increase background height
      mapLayersOptions.classList.add('mapLayerOptionsBackground');
      mapLayersOptions.classList.remove('mapLayerOptionsBackgroundResizeH');
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
