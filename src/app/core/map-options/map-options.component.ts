import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
  IterableDiffers,
  IterableDiffer,
} from '@angular/core';
import { Options } from '@angular-slider/ngx-slider';
import { FormControl, FormGroup } from '@angular/forms';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';
import { MapLayersService } from 'src/app/shared/services/map-layers.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FiltersService } from '../../shared/services/filters.service';
import { Observable } from 'rxjs/Observable';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { map, startWith } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import * as moment from 'moment';

@Component({
  selector: 'app-map-options',
  templateUrl: './map-options.component.html',
  styleUrls: ['./map-options.component.scss'],
})
export class MapOptionsComponent implements OnInit {
  //Layout
  public mapFilters: Boolean = true;
  public mapLayerOptions: Boolean = true;

  //Data from map service
  public parameterTypes$: Observable<any[]>;
  public methodTypes$: Observable<any[]>;
  public pcodeToMcode$: Observable<any[]>;
  public regions$: Observable<any[]>;
  public pcodeShortName;
  public pcodeToMcode;
  public mcodeShortName;
  public regions;
  public allMapData;

  //Intermediate data
  public matchingMcodes = [];
  public databaseChoices = [];

  //Map options
  displayAccessibleForms: Boolean = false;
  public paramMethodForm = new FormGroup({
    databaseControl: new FormControl(),
    parameterControl: new FormControl(),
    methodControl: new FormControl(),
  });
  public boundingBoxForm = new FormGroup({
    northControl: new FormControl(),
    southControl: new FormControl(),
    eastControl: new FormControl(),
    westControl: new FormControl(),
  });
  public northBounds: number;
  public southBounds: number;
  public eastBounds: number;
  public westBounds: number;
  public mapBoundsChecked: Boolean = false;
  public optimalAlignment: Boolean = false;
  minYear: number = 1980;
  maxYear: number = 2021;
  timeOptions: Options = {
    floor: 1980,
    ceil: 2021,
    animate: false,
    barDimension: 210,
  };
  public regionForm = new FormGroup({
    regionControl: new FormControl(),
  });

  //AutoComplete
  @ViewChild('paramInput') paramInput: ElementRef;
  chipParams = [];
  snToPcode = [];
  filteredParameters: Observable<any[]>;
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = false;
  separatorKeysCodes = [ENTER, COMMA];
  iterableDiffer;

  //Basemap layers
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
      maxZoom: 16,
    }
  );

  public imagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    }
  );

  constructor(
    private componentDisplayService: ComponentDisplayService,
    private mapLayersService: MapLayersService,
    private filterService: FiltersService,
    public snackBar: MatSnackBar,
    private iterableDiffers: IterableDiffers
  ) {
    this.parameterTypes$ = this.filterService.parameterTypes$;
    this.methodTypes$ = this.filterService.methodTypes$;
    this.pcodeToMcode$ = this.filterService.pcodeToMcode$;
    this.regions$ = this.filterService.regions$;
    this.iterableDiffer = iterableDiffers.find([]).create(null);
    this.databaseChoices = this.filterService.databaseChoices;
  }

  @HostListener('window:resize')

  //Resize the display whenever the window changes size
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    this.resizeDivs();
    this.populateDropdowns();
    this.getMapData();
    this.componentDisplayService.usaBarCollapseSubject.subscribe(
      (usaBarBoolean) => {
        setTimeout(() => {
          this.resizeDivs();
        }, 0.1);
      }
    );
    this.loadFormType();
    this.buildAccessibleDatabase();
  }
  ngDoCheck() {
    // Data processing slower then lifecycle hooks so waiting for array to be set before watching parameter control for changes
    // there may be a better way to do this
    let changes = this.iterableDiffer.diff(this.pcodeShortName);
    if (changes) {
      this.filteredParameters = this.paramMethodForm
        .get('parameterControl')
        .valueChanges.pipe(
          startWith(null),
          map((parameter: string | null) =>
            parameter ? this._filter(parameter) : this.pcodeShortName.slice()
          )
        );
    }
  }

  public getMapData() {
    this.mapLayersService.downloadMapQueryResultsSubject.subscribe(
      (mapQueryResults) => {
        this.allMapData = mapQueryResults;
      }
    );
  }

  public loadFormType() {
    //Load accessible or default forms according to selection in Accessibility Tips
    this.componentDisplayService.accessibleFormSubject.subscribe(
      (accessibleForms) => {
        if (accessibleForms) {
          this.displayAccessibleForms = true;
        } else {
          this.displayAccessibleForms = false;
        }
      }
    );
  }

  public downloadMapData() {
    for (let i = 0; i < this.allMapData.length; i++) {
      let currDate = this.allMapData[i].date_time_group;
      let formattedDate = moment(currDate).format('MM-DD-YYYY HH:mm:ss');
      this.allMapData[i]['date_formatted'] = formattedDate;
    }
    let mapContent = 'data:text/csv;charset=utf-8,';
    let csv = this.allMapData.map((row) => Object.values(row));
    csv.unshift(Object.keys(this.allMapData[0]));
    mapContent += csv.join('\n');
    let encodedUri = encodeURI(mapContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'mappedData.csv');
    document.body.appendChild(link);
    link.click();
  }

  //Get data from the service to populate options for dropdown menus
  public populateDropdowns() {
    this.pcodeToMcode$.subscribe((codes) => (this.pcodeToMcode = codes));
    this.parameterTypes$.subscribe((codes) => (this.pcodeShortName = codes));
    this.methodTypes$.subscribe((codes) => (this.mcodeShortName = codes));
    this.regions$.subscribe((codes) => (this.regions = codes));
  }

  //This is called whenever the parameter selection changes
  //It takes the selected parameters and uses them to populate Methods with corresponding methods
  public parameterSelected() {
    // chips contain the short_name so getting the pcodes
    for (let sn in this.chipParams) {
      let shortname = this.chipParams[sn];
      for (let p in this.pcodeShortName) {
        if (shortname == this.pcodeShortName[p].short_name) {
          this.snToPcode.push(this.pcodeShortName[p].pcode);
        }
      }
    }

    // removing duplicated parameters if there are any
    this.snToPcode = this.snToPcode.filter(function (value, index, array) {
      return array.indexOf(value) === index;
    });
    this.matchingMcodes = [];
    for (let x = 0; x < this.snToPcode.length; x++) {
      let mcodes = [];
      for (let pcode in this.pcodeToMcode) {
        if (pcode == this.snToPcode[x]) {
          for (let m = 0; m < this.pcodeToMcode[pcode].length; m++) {
            mcodes.push(this.pcodeToMcode[pcode][m]);
          }
          for (let i = 0; i < this.mcodeShortName.length; i++) {
            for (let x = 0; x < mcodes.length; x++) {
              if (mcodes[x] == this.mcodeShortName[i].mcode) {
                this.matchingMcodes.push(this.mcodeShortName[i]);
              }
            }
          }
        }
      }
    }
    this.buildAccessibleMethods();
  }

  //This is called whenever the region selection changes
  //Used to store the region selected in a way that can be accessed through Graph Options
  public regionSelected() {
    this.componentDisplayService.getStoreRegionSubject(
      this.regionForm.get('regionControl').value
    );
  }

  //This is called when 'Filter' button is clicked
  //It formats the user's selections into an object that can be used to retrieve data from the service
  public runFilters() {
    //sending click trigger for recognition in map.component
    this.mapLayersService.sendClearMapClickEvent();

    //Users must select at least one parameter, method, and database
    if (
      this.snToPcode == null ||
      this.paramMethodForm.get('methodControl').value == null ||
      this.paramMethodForm.get('databaseControl').value == null
    ) {
      this.snackBar.open(
        'Please select at least one parameter, method, and database.',
        'OK',
        {
          duration: 4000,
          verticalPosition: 'top',
        }
      );
    } else if (
      this.snToPcode.length == 0 ||
      this.paramMethodForm.get('methodControl').value.length == 0 ||
      this.paramMethodForm.get('databaseControl').value.length == 0
    ) {
      this.snackBar.open(
        'Please select at least one parameter, method, and database.',
        'OK',
        {
          duration: 4000,
          verticalPosition: 'top',
        }
      );
    } else {
      //format pcodes with their corresponding mcodes so they're compatible in the http request
      let items = new Object();
      //get the codes from the first two selections (parameters and methods)
      let tempP = this.snToPcode;
      let tempM = this.paramMethodForm.get('methodControl').value;
      if (tempP) {
        for (let i = 0; i < tempP.length; i++) {
          let matchMcodes = [];
          for (let pcode in this.pcodeToMcode) {
            if (pcode == tempP[i]) {
              let currentMcodes = [];
              currentMcodes.push(this.pcodeToMcode[pcode]);
              for (let y = 0; y < currentMcodes[0].length; y++) {
                if (tempM) {
                  //Match selected mcodes with their pcodes
                  for (let x = 0; x < tempM.length; x++) {
                    if (currentMcodes[0][y] == tempM[x]) {
                      matchMcodes.push(currentMcodes[0][y]);
                    }
                  }
                }
              }
            }
          }
          items[tempP[i]] = matchMcodes;
        }
      }
      let org = this.paramMethodForm.get('databaseControl').value;
      //If all databases are selected, submit 0
      //Otherwise, submit the first (only) one from the array
      if (org.length == this.databaseChoices.length) {
        org = 0;
      } else {
        org = org[0];
      }
      //Create the object used to retrieve data from the service
      let filterParameters = {
        meta: {
          north: parseFloat(this.boundingBoxForm.get('northControl').value),
          south: parseFloat(this.boundingBoxForm.get('southControl').value),
          east: parseFloat(this.boundingBoxForm.get('eastControl').value),
          west: parseFloat(this.boundingBoxForm.get('westControl').value),
          min_year: this.minYear,
          max_year: this.maxYear,
          include_NULL: false,
          satellite_align: this.optimalAlignment,
          region: this.regionForm.get('regionControl').value,
          organization: org,
        },
        items,
      };
      this.mapLayersService.filterWqSample(filterParameters);

      //minimize panels if the screen width is small
      let windowWidth = window.innerWidth;
      if (windowWidth < 900) {
        this.displayMapLayerOptions(false);
        this.displayMapFilters(false);
      }
    }
  }

  //This is called when a user minimizes/maximizes Map Options
  public displayMapFilters(display: Boolean) {
    this.mapFilters = display;
    //because toggling the panels changes the layout, resize elements as necessary
    this.resizeDivs();
  }

  //This is called when a user minimizes/maximizes Base Map Options
  public displayMapLayerOptions(display: Boolean) {
    this.mapLayerOptions = display;
    //because toggling the panels changes the layout, resize elements as necessary
    this.resizeDivs();
  }

  //This is called when a user checks/unchecks the satellite alignment option
  public clickSatelliteAlignment(satelliteAlignChecked: MatCheckboxChange) {
    if (satelliteAlignChecked.checked) {
      this.optimalAlignment = true;
    } else {
      this.optimalAlignment = false;
    }
  }

  //Creates html for the accessible form for selecting databases
  buildAccessibleDatabase() {
    let databaseHTML = '';

    //Create a checkbox for each of database option
    for (let i = 0; i < this.databaseChoices.length; i++) {
      databaseHTML +=
        "<input id='" +
        'databaseMap' +
        i +
        "' type='checkbox'><label for='" +
        'databaseMap' +
        i +
        "'>" +
        this.databaseChoices[i].name +
        '</label><br>';
    }

    //Insert the checkbox html into the database fieldset
    document.getElementById('databaseCheckboxMap').innerHTML = databaseHTML;
  }

  databaseCheckboxes(clear: Boolean) {
    //Find number of databases listed in the fieldset
    let numDatabaseOptions = this.databaseChoices.length;
    //To be populated with code from each checked database
    let selectedDatabase = [];
    for (let i = 0; i < numDatabaseOptions; i++) {
      //Get the ID of each database
      let databaseID = 'databaseMap' + i.toString();
      //Retrieve the element containing the database checkbox
      let currentDatabase = document.getElementById(
        databaseID
      ) as HTMLInputElement;

      //Uncheck checkboxes if "Clear Filters" was clicked
      if (clear) {
        currentDatabase.checked = false;
      }

      if (!clear) {
        let currDatabaseSelected = currentDatabase.checked;
        //See if the current database checkbox is checked
        if (currDatabaseSelected) {
          //If checked, add database code to the selectedDatabase array
          selectedDatabase.push(this.databaseChoices[i].code);
        }
      }
    }
    //Apply the database selections from the accessible form to the default form
    this.paramMethodForm.get('databaseControl').setValue(selectedDatabase);
  }

  buildAccessibleMethods() {
    let methodsHTML = '';

    //Create a checkbox for each of database option
    for (let i = 0; i < this.matchingMcodes.length; i++) {
      methodsHTML +=
        "<input id='" +
        'methods' +
        i +
        "' type='checkbox' name='methodMapCheck'><label for='" +
        'methods' +
        i +
        "'>" +
        this.matchingMcodes[i].short_name +
        '</label><br>';
    }

    if (methodsHTML == '') {
      methodsHTML = 'Select a parameter first';
    }
    //Insert the checkbox html into the fieldset
    document.getElementById('methodCheckbox').innerHTML = methodsHTML;
  }

  methodMap(clear: Boolean) {
    //Find number of methods listed in the fieldset
    let numOptions: number;

    numOptions = this.matchingMcodes.length;

    //To be populated with code from each checked method
    let selectedMethods = [];
    for (let i = 0; i < numOptions; i++) {
      //Get the ID of each method
      let methodID: string;
      methodID = 'methods' + i.toString();

      //Retrieve the element containing the checkbox
      let currentMethod = document.getElementById(methodID) as HTMLInputElement;

      //Uncheck checkboxes if "Clear Filters" was clicked
      if (clear) {
        currentMethod.checked = false;
      }

      if (!clear) {
        let currMethodSelected = currentMethod.checked;
        //See if the current checkbox is checked
        if (currMethodSelected) {
          //If checked, add code to the selectedDatabase array
          selectedMethods.push(this.matchingMcodes[i].mcode);
        }
        //Apply selections from the accessible form to the default form
        this.paramMethodForm.get('methodControl').setValue(selectedMethods);
      }
    }
  }

  //This is called when the base map changes
  //Add the new basemap; remove the old
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

  public storeNorth() {
    //Setting these variables so they can be used to populate graph options if that checkbox is selected
    this.componentDisplayService.getStoreNorthBounds(
      parseFloat(this.boundingBoxForm.get('northControl').value)
    );
  }
  public storeSouth() {
    //Setting these variables so they can be used to populate graph options if that checkbox is selected
    this.componentDisplayService.getStoreSouthBounds(
      parseFloat(this.boundingBoxForm.get('southControl').value)
    );
  }
  public storeEast() {
    //Setting these variables so they can be used to populate graph options if that checkbox is selected
    this.componentDisplayService.getStoreEastBounds(
      parseFloat(this.boundingBoxForm.get('eastControl').value)
    );
  }
  public storeWest() {
    //Setting these variables so they can be used to populate graph options if that checkbox is selected
    this.componentDisplayService.getStoreWestBounds(
      parseFloat(this.boundingBoxForm.get('westControl').value)
    );
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

      this.boundingBoxForm.get('northControl').setValue(this.northBounds);
      this.boundingBoxForm.get('southControl').setValue(this.southBounds);
      this.boundingBoxForm.get('eastControl').setValue(this.eastBounds);
      this.boundingBoxForm.get('westControl').setValue(this.westBounds);

      //Setting these variables so they can be used to populate graph options if that checkbox is selected
      this.componentDisplayService.getStoreNorthBounds(this.northBounds);
      this.componentDisplayService.getStoreSouthBounds(this.southBounds);
      this.componentDisplayService.getStoreEastBounds(this.eastBounds);
      this.componentDisplayService.getStoreWestBounds(this.westBounds);
    }
    if (!boundsChecked) {
      this.boundingBoxForm.get('northControl').setValue('');
      this.boundingBoxForm.get('southControl').setValue('');
      this.boundingBoxForm.get('eastControl').setValue('');
      this.boundingBoxForm.get('westControl').setValue('');
    }
  }

  // remove chip
  remove(param: any): void {
    let pcode = '';
    const index = this.chipParams.indexOf(param);

    if (index >= 0) {
      this.chipParams.splice(index, 1);
    }

    // getting pcode from chip and removing from array
    for (let p in this.pcodeShortName) {
      if (param == this.pcodeShortName[p].short_name) {
        pcode = this.pcodeShortName[p].pcode;
      }
    }
    if (this.snToPcode.includes(pcode)) {
      this.snToPcode = this.snToPcode.filter((x) => x !== pcode);
    }

    this.parameterSelected();
  }

  // filter using typed string
  _filter(name: string) {
    return this.pcodeShortName.filter(
      (parameter) =>
        parameter.short_name.toLowerCase().indexOf(name.toLowerCase()) === 0
    );
  }

  // selected param
  selectedParameter(event: MatAutocompleteSelectedEvent): void {
    this.chipParams.push(event.option.value);
    this.paramInput.nativeElement.value = '';
    this.paramMethodForm.get('parameterControl').setValue(null);
    this.parameterSelected();
  }

  // called when slider is adjusted and updates min & max year observables for use in other components
  updateYears(event) {
    this.filterService.getMaxYear(event.highValue);
    this.filterService.getMinYear(event.value);
  }

  public resizeDivs() {
    //get map height
    let mapContainer = document.getElementById('mapContainer');
    let mapHeight = parseInt(window.getComputedStyle(mapContainer).height);

    //get window width
    let windowWidth = window.innerWidth;

    //get all the elements that change according to window dimensions
    let mapPointFilterDiv = document.getElementById('mapOptionsContainer');
    let mapLayersOptions = document.getElementById('mapLayersOptions');
    let filterPointsCollapsed = document.getElementById(
      'filterPointsCollapsed'
    );
    let mapLayersCollapsed = document.getElementById('mapLayersCollapsed');
    let additionalSpace: number = 0;

    if (!this.mapLayerOptions) {
      additionalSpace = 60;
    }

    //move everything to the left when the width shrinks
    if (windowWidth < 900) {
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
    if (windowWidth > 900) {
      mapLayersOptions.classList.add('marginLeftFullWidth');
      mapLayersOptions.classList.remove('marginLeftSmallWidth');

      mapPointFilterDiv.classList.add('marginLeftFullWidth');
      mapPointFilterDiv.classList.remove('marginLeftSmallWidth');

      filterPointsCollapsed.classList.add('marginLeftFullWidth');
      filterPointsCollapsed.classList.remove('marginLeftSmallWidth');

      mapLayersCollapsed.classList.add('marginLeftFullWidth');
      mapLayersCollapsed.classList.remove('marginLeftSmallWidth');
    }

    if (mapHeight < 570) {
      //reduce spacing between collapsed map layers and nav buttons
      mapLayersCollapsed.classList.remove('marginTopFullHeight');
      mapLayersCollapsed.classList.add('marginTopSmallHeight');

      //decrease the margin between map layers and point filters
      filterPointsCollapsed.classList.remove('marginTopFullHeight');
      filterPointsCollapsed.classList.add('marginTopSmallHeight');

      //reduce spacing between map layers and nav buttons
      mapLayersOptions.classList.remove('marginTopFullHeight');
      mapLayersOptions.classList.add('marginTopSmallHeight');

      //reduce spacing between point filters and map layers
      mapPointFilterDiv.classList.remove('marginTopFullHeight');
      mapPointFilterDiv.classList.add('marginTopSmallHeight');

      //set height of point filters according to map height
      mapPointFilterDiv.style.height =
        (mapHeight - 220 + additionalSpace).toString() + 'px';
    }
    if (mapHeight > 570) {
      //increase spacing between collapsed map layers and nav buttons
      mapLayersCollapsed.classList.add('marginTopFullHeight');
      mapLayersCollapsed.classList.remove('marginTopSmallHeight');

      //increase the spacing between map layers and point filters
      filterPointsCollapsed.classList.add('marginTopFullHeight');
      filterPointsCollapsed.classList.remove('marginTopSmallHeight');

      //increase spacing between map layers and nav buttons
      mapLayersOptions.classList.add('marginTopFullHeight');
      mapLayersOptions.classList.remove('marginTopSmallHeight');

      //reduce spacing between point filters and map layers
      mapPointFilterDiv.classList.add('marginTopFullHeight');
      mapPointFilterDiv.classList.remove('marginTopSmallHeight');

      //set height of point filters according to map height
      mapPointFilterDiv.style.height =
        (mapHeight - 250 + additionalSpace).toString() + 'px';
    }
  }

  clearMapFilters() {
    // resetting forms
    this.paramMethodForm.reset();
    this.boundingBoxForm.reset();
    this.regionForm.reset();

    //resetting variables
    this.filterService.getMaxYear(2021);
    this.filterService.getMinYear(1980);
    this.minYear = 1980;
    this.maxYear = 2021;
    this.matchingMcodes = [];
    this.snToPcode = [];

    // resetting checkboxes
    if (this.optimalAlignment == true) {
      this.optimalAlignment = false;
    }
    // resetting chip list else the selected param chip remains
    this.chipParams = [];

    //sending click trigger for recognition in map.component
    this.mapLayersService.sendClearMapClickEvent();

    //Clear accessible forms
    this.databaseCheckboxes(true);
    this.methodMap(true);
    this.buildAccessibleMethods();
  }
}
