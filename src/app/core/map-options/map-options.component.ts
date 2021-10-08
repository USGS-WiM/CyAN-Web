import { Component, OnInit, HostListener } from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';
import { MapLayersService } from 'src/app/shared/services/map-layers.service';
import { MarkersService } from 'src/app/shared/services/markers.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FiltersService } from '../../shared/services/filters.service';
import { Observable } from 'rxjs/Observable';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-options',
  templateUrl: './map-options.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class MapOptionsComponent implements OnInit {
  public parameterTypes$: Observable<any[]>;
  public methodTypes$: Observable<any[]>;
  public pcodeToMcode$: Observable<any[]>;
  public pcodeToMcode;
  public mcodeShortName;
  public matchingMcodes = [];
  public mapForm: FormGroup;
  public codeForm: FormGroup;
  public mapFilters: Boolean = true;
  public mapLayerOptions: Boolean = true;
  public northBounds: number;
  public southBounds: number;
  public eastBounds: number;
  public westBounds: number;
  public mapBoundsChecked: Boolean = false;
  public showNullWarning: Boolean = false;
  public includeNullSites: Boolean = false;
  public nullDataChecked: Boolean = false;
  public optimalAlignment: Boolean = false;
  public nullCheckboxElement = document.getElementById('nullCheckbox');
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
  minYear: number = 1975;
  maxYear: number = 2021;
  timeOptions: Options = {
    floor: 1975,
    ceil: 2021,
    animate: false,
    barDimension: 210,
  };

  Parameters = new FormControl();

  Methods = new FormControl();
  methodsList: any[] = [
    { name: 'Method 1', code: 'abc' },
    { name: 'Method 2', code: 'def' },
    { name: 'Method 3', code: 'ghi' },
    { name: 'Method 4', code: 'jkl' },
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
    private componentDisplayService: ComponentDisplayService,
    private mapLayersService: MapLayersService,
    private markersService: MarkersService,
    private filterService: FiltersService
  ) {
    this.parameterTypes$ = this.filterService.parameterTypes$;
    this.methodTypes$ = this.filterService.methodTypes$;
    this.pcodeToMcode$ = this.filterService.pcodeToMcode$;
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
    this.codeForm = new FormGroup({
      parameterControl: new FormControl(),
      methodControl: new FormControl(),
    });
    this.resizeDivs();
    this.pcodeToMcode$.subscribe((codes) => (this.pcodeToMcode = codes));
    this.methodTypes$.subscribe((codes) => (this.mcodeShortName = codes));
  }

  public parameterSelected() {
    this.matchingMcodes = [];
    let tempParameter = [];
    tempParameter.push(this.codeForm.get('parameterControl').value);
    for (let x = 0; x < tempParameter[0].length; x++) {
      let mcodes = [];
      for (let pcode in this.pcodeToMcode) {
        if (pcode == tempParameter[0][x]) {
          mcodes.push(this.pcodeToMcode[pcode]);
          for (let i = 0; i < this.mcodeShortName.length; i++) {
            for (let x = 0; x < mcodes[0].length; x++) {
              if (mcodes[0][x] == this.mcodeShortName[i].mcode) {
                this.matchingMcodes.push(this.mcodeShortName[i]);
              }
            }
          }
        }
      }
    }
  }

  public runFilters() {
    //format pcodes with their corresponding mcodes so they're compatible in the http request
    let items = new Object();
    let tempP = this.codeForm.get('parameterControl').value;
    let tempM = this.codeForm.get('methodControl').value;
    if (tempP) {
      for (let i = 0; i < tempP.length; i++) {
        let matchMcodes = [];
        for (let pcode in this.pcodeToMcode) {
          if (pcode == tempP[i]) {
            let currentMcodes = [];
            currentMcodes.push(this.pcodeToMcode[pcode]);
            for (let y = 0; y < currentMcodes.length; y++) {
              if (tempM) {
                for (let x = 0; x < tempM.length; x++) {
                  if (currentMcodes[y] == tempM[x]) {
                    matchMcodes.push(currentMcodes[y]);
                  }
                }
              }
            }
          }
        }
        items[tempP[i]] = matchMcodes[0];
      }
    }
    let filterParameters = {
      meta: {
        north: parseFloat(this.mapForm.get('northControl').value),
        south: parseFloat(this.mapForm.get('southControl').value),
        east: parseFloat(this.mapForm.get('eastControl').value),
        west: parseFloat(this.mapForm.get('westControl').value),
        min_year: this.minYear,
        max_year: this.maxYear,
        include_NULL: this.includeNullSites,
        satellite_align: this.optimalAlignment,
      },
      items,
    };
    this.mapLayersService.filterWqSample(filterParameters);
  }

  public displayMapFilters(display: Boolean) {
    this.mapFilters = display;
    //because toggling the panels changes the layout, resize elements as necessary
    this.resizeDivs();
  }

  public displayMapLayerOptions(display: Boolean) {
    this.mapLayerOptions = display;
    //because toggling the panels changes the layout, resize elements as necessary
    this.resizeDivs();
  }

  public changeBasemap(selectedBasemap: string) {
    if (selectedBasemap === 'streets') {
    }
    if (selectedBasemap === 'imagery') {
    }
    if (selectedBasemap === 'grayscale') {
    }
  }

  public resizeDivs() {
    //get window dimensions
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;

    //get all the elements that change according to window dimensions
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

    //move everything to the left when the width shrinks
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

    //move everything to the right when the width grows
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
    //initiate the filter points scroll depending on the height of the screen and whether the Map Layers panel is collapsed
    if (
      (this.mapLayerOptions && windowHeight < 788) ||
      (!this.mapLayerOptions && windowHeight < 710)
    ) {
      //if the filters panel is open, decrease the spacing above collapsed Map Filters
      //if the height is super tiny (<280), do this regardless of the filters panel
      if (this.mapFilters || windowHeight < 280) {
        mapLayersCollapsed.classList.remove('marginTopFullHeight');
        mapLayersCollapsed.classList.add('marginTopSmallHeight');

        filterPointsCollapsed.classList.remove('marginTopFullHeight');
        filterPointsCollapsed.classList.add('marginTopSmallHeight');

        //the percentage of the screen that the filters panel takes up depends on the spacing and whether or not Map Layers is collapsed
        mapPointFilterDiv.classList.remove('mapFiltersFullHeight');
        mapPointFilterDiv.classList.remove('mapFiltersMLHeight');
        if (this.mapLayerOptions) {
          mapPointFilterDiv.classList.remove('mapFiltersMedHeight');
          mapPointFilterDiv.classList.add('mapFiltersSmallHeight');
        }
        if (!this.mapLayerOptions) {
          mapPointFilterDiv.classList.remove('mapFiltersSmallHeight');
          mapPointFilterDiv.classList.add('mapFiltersMedHeight');
        }

        mapPointFilterDiv.classList.remove('marginTopFullHeight');
        mapPointFilterDiv.classList.add('marginTopSmallHeight');

        //reduce spacing between map layers and nav buttons
        mapLayersOptions.classList.remove('marginTopFullHeight');
        mapLayersOptions.classList.add('marginTopSmallHeight');
      }
      //
      if (!this.mapFilters && windowHeight > 280) {
        mapLayersCollapsed.classList.add('marginTopFullHeight');
        mapLayersCollapsed.classList.remove('marginTopSmallHeight');

        filterPointsCollapsed.classList.add('marginTopFullHeight');
        filterPointsCollapsed.classList.remove('marginTopSmallHeight');

        //reduce spacing between map layers and nav buttons
        mapLayersOptions.classList.add('marginTopFullHeight');
        mapLayersOptions.classList.remove('marginTopSmallHeight');
      }
    }
    //remove the filter points scroll depending on the height of the screen and whether the Map Layers panel is collapsed
    if (
      (this.mapLayerOptions && windowHeight > 788) ||
      (!this.mapLayerOptions && windowHeight > 710)
    ) {
      mapPointFilterDiv.classList.add('mapFiltersFullHeight');
      mapPointFilterDiv.classList.remove('mapFiltersSmallHeight');
      mapPointFilterDiv.classList.remove('mapFiltersMedHeight');
      mapPointFilterDiv.classList.remove('mapFiltersMLHeight');

      mapPointFilterDiv.classList.add('marginTopFullHeight');
      mapPointFilterDiv.classList.remove('marginTopSmallHeight');

      //increase spacing between map layers and nav buttons
      mapLayersOptions.classList.add('marginTopFullHeight');
      mapLayersOptions.classList.remove('marginTopSmallHeight');

      //increase the spacing above collapsed Map Layers
      mapLayersCollapsed.classList.add('marginTopFullHeight');
      mapLayersCollapsed.classList.remove('marginTopSmallHeight');

      //increase the spacing above collapsed Map Filters
      filterPointsCollapsed.classList.add('marginTopFullHeight');
      filterPointsCollapsed.classList.remove('marginTopSmallHeight');
    }

    //Edit map layers box when the height shrinks
    if (windowHeight < 530) {
      mapPointFilterDiv.classList.remove('mapFiltersFullHeight');
      if (this.mapLayerOptions) {
        mapPointFilterDiv.classList.remove('mapFiltersMedHeight');
        mapPointFilterDiv.classList.remove('mapFiltersSmallHeight');
        mapPointFilterDiv.classList.add('mapFiltersMLHeight');
      }

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

      //decrease background height
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

      //increase background height
      mapLayersOptions.classList.add('mapLayerOptionsBackground');
      mapLayersOptions.classList.remove('mapLayerOptionsBackgroundResizeH');
    }
  }

  public populateMapBounds(boundsChecked: Boolean) {
    if (boundsChecked) {
      this.componentDisplayService.northBoundsSubject.subscribe((lat) => {
        if (lat && boundsChecked) {
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
    if (!boundsChecked) {
      let testVal: number;
      this.mapForm.get('northControl').setValue(testVal);
      this.mapForm.get('southControl').setValue('');
      this.mapForm.get('eastControl').setValue('');
      this.mapForm.get('westControl').setValue('');
    }
  }

  public nullwarning(nullChecked: MatCheckboxChange) {
    this.nullDataChecked = false;
    let mapLayersOptions = document.getElementById('mapLayersOptions');
    let mapOptionsContainer = document.getElementById('mapOptionsContainer');
    if (nullChecked.checked) {
      this.showNullWarning = true;
      mapLayersOptions.classList.add('disableClick');
      mapOptionsContainer.classList.add('disableClick');
    } else {
      this.showNullWarning = false;
      mapOptionsContainer.classList.remove('disableClick');
      mapLayersOptions.classList.remove('disableClick');
    }
  }

  public submitNullWarning(showNullSites: Boolean) {
    let mapLayersOptions = document.getElementById('mapLayersOptions');
    let mapOptionsContainer = document.getElementById('mapOptionsContainer');

    mapLayersOptions.classList.remove('disableClick');
    mapOptionsContainer.classList.remove('disableClick');

    let nullCheckboxElement = document.getElementById(
      'nullCheckbox'
    ) as HTMLInputElement;
    // nullCheckboxElement.checked = true;
    this.showNullWarning = false;
    if (showNullSites) {
      this.includeNullSites = true;
      this.nullDataChecked = true;
    } else {
      nullCheckboxElement.classList.remove('mat-checkbox-checked');
      this.includeNullSites = false;
      this.nullDataChecked = false;
    }
  }

  public clickSatelliteAlignment(satelliteAlignChecked: MatCheckboxChange) {
    if (satelliteAlignChecked.checked) {
      this.optimalAlignment = true;
    } else {
      this.optimalAlignment = false;
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
      this.mapLayersService.getBasemap(this.osm);
      this.mapLayersService.removeBasemap(this.imagery);
      this.mapLayersService.removeBasemap(this.grayscale);
    }
    if (imageryRadioBtn.checked) {
      this.mapLayersService.getBasemap(this.imagery);
      this.mapLayersService.removeBasemap(this.osm);
      this.mapLayersService.removeBasemap(this.grayscale);
    }
    if (grayscaleRadioBtn.checked) {
      this.mapLayersService.getBasemap(this.grayscale);
      this.mapLayersService.removeBasemap(this.imagery);
      this.mapLayersService.removeBasemap(this.osm);
    }
  }
}
