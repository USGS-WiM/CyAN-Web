import {
  Component,
  OnInit,
  HostListener,
  IterableDiffers,
  ViewChild,
} from '@angular/core';
import * as Plotly from 'plotly.js-dist';
import { FormControl, FormGroup } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { FiltersService } from '../../shared/services/filters.service';
import { GraphSelectionsService } from 'src/app/shared/services/graph-selections.service';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';
import { Observable } from 'rxjs/Observable';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, startWith } from 'rxjs/operators';
import { TOOLTIPS } from '../../app.tooltips';
import * as moment from 'moment';

@Component({
  selector: 'app-graph-options',
  templateUrl: './graph-options.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class GraphOptionsComponent implements OnInit {
  //Overall display
  public graphOptionsVisible: Boolean = true;
  public showGraph = false;
  public bivariatePlot: any;
  public alreadyGraphed: Boolean = false;

  //Graph options
  displayAccessibleForms: Boolean = false;
  graphSelectionsForm = new FormGroup({
    Database: new FormControl(),
    ParametersX: new FormControl(),
    MethodsX: new FormControl(),
    ParametersY: new FormControl(),
    MethodsY: new FormControl(),
  });
  public optimalAlignment: Boolean = false;
  public useBoundingBox: Boolean = false;
  minYear: number = 1980;
  maxYear: number = 2021;
  count: 0;
  timeOptions: Options = {
    floor: 1980,
    ceil: 2021,
    barDimension: 210,
    animate: false,
  };
  north: number = 90;
  south: number = -90;
  east: number = 180;
  west: number = -180;
  regions: any[];
  datefromMapChecked = false;
  @ViewChild('datefromMap') datefromMap: MatCheckbox;

  //flags
  flaggedData = [];
  showFlagOptions: Boolean = false;
  showFlagOptionsX: Boolean = false;
  showFlagOptionsY: Boolean = false;
  submitAfterX: Boolean = false;
  noFlagsSelected: Boolean = false;
  onlyYflags: Boolean = false;
  differentYflags: Boolean = false;
  maxFlagModalHeight;
  showUnflagOptions: Boolean = false;
  showLassoFlagOptions: Boolean = false;
  lasso: Boolean = false;
  sameQuery: Boolean = false;
  flagAll: Boolean = false;
  unflagAll: Boolean = false;
  xAxisChecked: Boolean = false;
  yAxisChecked: Boolean = false;
  clickedPoint;
  public axisFlagForm = new FormGroup({
    xFlagControl: new FormControl(),
    yFlagControl: new FormControl(),
    xyFlagControl: new FormControl(),
  });
  public flagTypesX = new FormGroup({
    centralTendency: new FormControl(),
    outlier: new FormControl(),
    matrixInterference: new FormControl(),
    dissolvedGTTotal: new FormControl(),
    phytoChl: new FormControl(),
    unknown: new FormControl(),
  });
  public flagTypesY = new FormGroup({
    centralTendency: new FormControl(),
    outlier: new FormControl(),
    matrixInterference: new FormControl(),
    dissolvedGTTotal: new FormControl(),
    phytoChl: new FormControl(),
    unknown: new FormControl(),
  });
  public sameXYFlag = new FormGroup({
    diffY: new FormControl(),
  });
  public flags$: Observable<any[]>;
  //Colors for all 4 flagging options
  public unflaggedColor: string = 'rgba(242, 204, 177, 0.2)';
  public xyFlaggedColor: string = 'rgb(17, 119, 51)';
  public xFlaggedColor: string = 'rgb(136, 204, 238)';
  public yFlaggedColor: string = 'rgb(170, 68, 153)';
  public pointBorderColor: string = 'rgba(242, 204, 177, 1)';
  //Symbols for flagged vs unflagged
  public allColors = [];
  public allShapes = [];
  public allBorderWidths = [];
  public allSizes = [];
  public unflaggedSymbol: string = 'circle';
  public flaggedSymbol: string = 'circle';
  public unflaggedSize: number = 16;
  public flaggedSize: number = 13;
  public flaggedBorderWidth: number = 0;
  public unflaggedBorderWidth: number = 2;
  public singlePointSelected: Boolean = true;
  public xySymbol: string = 'cross';
  public xSymbol: string = 'triangle-up';
  public ySymbol: string = 'square';

  public selectedPoints;

  //Intermediate data
  public matchingMcodesY = [];
  public matchingMcodesX = [];
  public databaseChoices = [];

  //Data sent to service
  public filterQueryX;
  public filterQueryY;

  //Data retrieved from service
  public parameterTypes$: Observable<any[]>;
  public methodTypes$: Observable<any[]>;
  public pcodeToMcode$: Observable<any[]>;
  public pcodeToMcode;
  public mcodeShortName;
  public parameterTypes;
  public allFlagTypes;

  //Autocomplete
  filteredParametersX: Observable<any[]>;
  filteredParametersY: Observable<any[]>;
  iterableDiffer;

  //Graph data
  public xDataTrace1;
  public yDataTrace1;
  public xDataTrace2;
  public yDataTrace2;
  public currentXaxisValues = [];
  public currentYaxisValues = [];
  public flaggedPointIndices = { x: [], y: [] };
  public allGraphData;
  public graphMetadata;

  //Graph layout
  public graphHeight: Number;
  public graphWidth: Number;
  public graphMargins: Number;
  public xAxisType = 'scatter';
  public yAxisType = 'scatter';
  public yAxisTitle = '';
  public xAxisTitle = '';
  public yAxisParameter = '';
  public xAxisParameter = '';
  public autotickEnabled: Boolean = true;
  public xAxisUnits: string = '';
  public yAxisUnits: string = '';

  constructor(
    private filterService: FiltersService,
    private graphSelectionsService: GraphSelectionsService,
    public snackBar: MatSnackBar,
    private componentDisplayService: ComponentDisplayService,
    private iterableDiffers: IterableDiffers
  ) {
    this.parameterTypes$ = this.filterService.parameterTypes$;
    this.methodTypes$ = this.filterService.methodTypes$;
    this.pcodeToMcode$ = this.filterService.pcodeToMcode$;
    this.iterableDiffer = iterableDiffers.find([]).create(null);
    this.allFlagTypes = this.filterService.flagTypes;
    this.databaseChoices = this.filterService.databaseChoices;
  }

  //Adjust the css (via resizeDivs()) when the window is resized
  @HostListener('window:resize')
  onResize() {
    this.resizeDivs(true);
  }

  @HostListener('window:beforeunload')
  alert() {
    if (this.flaggedData.length > 0) {
      // returning false will show a browser warning
      return false;
    } else {
      // returning true will navigate without confirmation
      return true;
    }
  }

  ngOnInit(): void {
    //Set the display according to the initial screen dimensions
    this.resizeDivs(false);
    this.getDataForDropdowns();
    this.initiateGraphService();
    this.getUnits();
    this.graphSelectionsService.getFlagConfirmClickEvent().subscribe(() => {
      this.graphSelectionsService.flagsSubject.next(
        JSON.parse(localStorage['cyanFlags'])
      );
      this.flaggedData = JSON.parse(localStorage['cyanFlags']);
    });
    this.componentDisplayService.usaBarCollapseSubject.subscribe(
      (usaBarBoolean) => {
        setTimeout(() => {
          this.resizeDivs(true);
        }, 0.1);
      }
    );
    this.loadFormType();
    this.buildAccessibleDatabase();
  }

  ngDoCheck() {
    // Data processing slower then lifecycle hooks so waiting for array to be full before watching parameter control for changes
    // there may be a better way to do this
    let changes = this.iterableDiffer.diff(this.parameterTypes);
    if (changes) {
      this.filteredParametersX = this.graphSelectionsForm
        .get('ParametersX')
        .valueChanges.pipe(
          startWith(null),
          map((parameter: string | null) =>
            parameter ? this._filter(parameter) : this.parameterTypes.slice()
          )
        );
      this.filteredParametersY = this.graphSelectionsForm
        .get('ParametersY')
        .valueChanges.pipe(
          startWith(null),
          map((parameter: string | null) =>
            parameter ? this._filter(parameter) : this.parameterTypes.slice()
          )
        );
    }
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

  public getDataForDropdowns() {
    //Get the data to populate the dropdowns in Graph Options
    this.pcodeToMcode$.subscribe((codes) => (this.pcodeToMcode = codes));
    this.methodTypes$.subscribe((codes) => (this.mcodeShortName = codes));
    this.parameterTypes$.subscribe(
      (parameters) => (this.parameterTypes = parameters)
    );
  }

  public getUnits() {
    //Get units for axes labels
    this.graphSelectionsService.xAxisUnitsSubject.subscribe((xUnits) => {
      this.xAxisUnits = xUnits;
      this.xAxisTitle = this.xAxisParameter + ' <br> ' + xUnits;
    });
    this.graphSelectionsService.yAxisUnitsSubject.subscribe((yUnits) => {
      this.yAxisUnits = yUnits;
      this.yAxisTitle = this.yAxisParameter + ' <br> ' + yUnits;
    });
  }

  public initiateGraphService() {
    this.graphSelectionsService.flagsSubject.subscribe((flags) => {
      if (flags) {
        if (flags.length > 0) {
          this.flaggedData = flags;
          this.disableEnable('flagBtn', true, true);
        } else {
          this.disableEnable('flagBtn', false, true);
        }
      } else {
        this.disableEnable('flagBtn', false, true);
      }
    });

    //this.graphSelectionsService.makeGraphSubject.subscribe((makeGraph) => {
    this.graphSelectionsService.makeGraphSubject.subscribe((makeGraph) => {
      //Reset the x and y values displayed on the graph whenever the values change in the service
      if (makeGraph === true && this.alreadyGraphed === false) {
        this.graphSelectionsService.graphPointsXSubject.subscribe((points) => {
          //get the x values to plot
          this.currentXaxisValues = points;
          this.graphSelectionsService.graphPointsYSubject.subscribe(
            (points) => {
              //get the y values to plot
              this.currentYaxisValues = points;
              //proceed if both the x and y data are ready
              if (this.currentYaxisValues && this.currentXaxisValues) {
                if (
                  this.currentYaxisValues.length > 0 &&
                  this.currentXaxisValues.length > 0
                ) {
                  this.alreadyGraphed = true;

                  //Create and display graph
                  this.createGraph(true);
                  //Prepare graph metadata
                  this.createGraphMetadata();

                  //Check for flags
                  this.showGraph = true;
                  //Remove the WIM loader to view graph
                  let base = document.getElementById('base');
                  base.classList.remove('initial-loader');
                  this.disableEnable('graphOptionsBackgroundID', true, false);
                  this.disableEnable('graphDataDownloadBtn', true, true);
                }
              }
              if (!this.currentYaxisValues || !this.currentXaxisValues) {
                if (this.alreadyGraphed === false) {
                  this.alreadyGraphed = true;
                  let base = document.getElementById('base');
                  base.classList.remove('initial-loader');
                  this.showGraph = false;
                  this.disableEnable('graphOptionsBackgroundID', true, false);
                  this.disableEnable('graphDataDownloadBtn', true, true);
                }
              }
            }
          );
        });
      }
    });
  }

  public createGraphMetadata() {
    let maxDateReturned;
    let minDateReturned;
    this.graphSelectionsService.maxDateSubject.subscribe(
      (maxDate) => (maxDateReturned = maxDate)
    );
    this.graphSelectionsService.minDateSubject.subscribe(
      (minDate) => (minDateReturned = minDate)
    );

    //Format the database names for the metadata download
    let orgValue = this.graphSelectionsForm.get('Database').value;
    let orgName: string = '';
    //Get the code of each selected database
    for (let i = 0; i < orgValue.length; i++) {
      //Get the name of each database corresponding with the codes
      let tempOrg = this.databaseChoices[i].name.toString();
      if (i !== orgValue.length - 1) {
        //If multiple databases were selected, create a string of their names joined by a ;
        orgName = orgName + tempOrg + '; ';
      } else {
        orgName = orgName + tempOrg;
      }
    }

    //Remove commas so they don't interfere with the csv format
    let formattedRegion = String(this.filterQueryX.meta.region);
    formattedRegion = formattedRegion.replace(/,/g, '; ');
    let formattedMcodeX = String(
      this.graphSelectionsForm.get('MethodsX').value
    );
    formattedMcodeX = formattedMcodeX.replace(/,/g, '; ');
    let formattedMcodeY = String(
      this.graphSelectionsForm.get('MethodsY').value
    );
    formattedMcodeY = formattedMcodeY.replace(/,/g, '; ');

    this.graphMetadata = [
      [
        'North',
        'South',
        'East',
        'West',
        'Min_Year_Selected',
        'Max_Year_Selected',
        'Min_Date_Returned',
        'Max_Date_Returned',
        'Region',
        'Optimal_Alignment',
        'X_Parameter',
        'X_Method',
        'Y_Parameter',
        'Y_Method',
        'X_Units',
        'Y_Units',
        'Database',
      ],
      [
        this.filterQueryX.meta.north,
        this.filterQueryX.meta.south,
        this.filterQueryX.meta.east,
        this.filterQueryX.meta.west,
        this.filterQueryX.meta.min_year,
        this.filterQueryX.meta.max_year,
        minDateReturned,
        maxDateReturned,
        formattedRegion,
        this.filterQueryX.meta.satellite_align,
        this.graphSelectionsForm.get('ParametersX').value.pcode,
        formattedMcodeX,
        this.graphSelectionsForm.get('ParametersY').value.pcode,
        formattedMcodeY,
        this.xAxisUnits,
        this.yAxisUnits,
        orgName,
      ],
    ];
  }

  //When a parameter is selected, this function is called to populate the Methods dropdown
  public populateMcodeDropdown(axis) {
    let formName = '';
    if (axis === 'xaxis') {
      this.matchingMcodesX = [];
      formName = 'ParametersX';
    }
    if (axis === 'yaxis') {
      this.matchingMcodesY = [];
      formName = 'ParametersY';
    }
    //Get the parameter code from the dropdown selection
    let tempParameter = this.graphSelectionsForm.get(formName).value;
    for (let pcode in this.pcodeToMcode) {
      if (pcode == tempParameter.pcode) {
        //get list of corresponding mcodes
        let mcodes = this.pcodeToMcode[pcode];
        //match the mcode to the mcode short names to populate dropdown
        for (let i = 0; i < this.mcodeShortName.length; i++) {
          for (let x = 0; x < mcodes.length; x++) {
            if (mcodes[x] == this.mcodeShortName[i].mcode) {
              if (axis === 'xaxis') {
                this.matchingMcodesX.push(this.mcodeShortName[i]);
              }
              if (axis === 'yaxis') {
                this.matchingMcodesY.push(this.mcodeShortName[i]);
              }
            }
          }
        }
      }
    }
    this.buildAccessibleMethods(axis);
  }

  //Called when minimize options is clicked
  //Shrinks Graph Options panel into a button and expands the graph
  public collapseGraphOptions(collapsed: Boolean) {
    this.graphOptionsVisible = collapsed;
    this.resizeDivs(true);
  }

  public createGraph(newPlot: Boolean) {
    // getting count of not plotted results (less thans)
    this.graphSelectionsService.excludedFromGraphCountSubject.subscribe(
      (num) => {
        this.count = num;
      }
    );

    if (newPlot) {
      this.allColors = this.graphSelectionsService.pointColors;
      this.allShapes = this.graphSelectionsService.pointSymbol;
      this.allBorderWidths = this.graphSelectionsService.allBorderWidths;
      this.allSizes = this.graphSelectionsService.allSizes;
    }
    //Designate div to put graph
    this.bivariatePlot = document.getElementById('graph');

    var allData = {
      x: this.currentXaxisValues,
      y: this.currentYaxisValues,
      mode: 'markers',
      type: 'scatter',
      name: 'None',
      showlegend: false,
      hovertemplate: 'x: %{x} <br> y: %{y} <extra></extra>',
      textposition: 'bottom center',
      marker: {
        size: this.allSizes,
        color: this.allColors,
        symbol: this.allShapes,
        line: {
          color: this.pointBorderColor,
          width: this.allBorderWidths,
        },
      },
    };

    let AxisLegendFillerAllData = {
      x: [null],
      y: [null],
      showlegend: true,
      name: 'None',
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 16,
        color: this.unflaggedColor,
        symbol: this.unflaggedSymbol,
        line: {
          color: this.pointBorderColor,
          width: this.unflaggedBorderWidth,
        },
      },
    };

    let AxisLegendFillerX = {
      x: [null],
      y: [null],
      showlegend: true,
      name: 'X-Axis',
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 12,
        color: this.xFlaggedColor,
        symbol: this.xSymbol,
      },
    };

    let AxisLegendFillerY = {
      x: [null],
      y: [null],
      showlegend: true,
      name: 'Y-Axis',
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 12,
        color: this.yFlaggedColor,
        symbol: this.ySymbol,
      },
    };

    let AxisLegendFillerXY = {
      x: [null],
      y: [null],
      showlegend: true,
      name: 'Both Axes',
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 12,
        color: this.xyFlaggedColor,
        symbol: this.xySymbol,
      },
    };

    var data = [
      allData,
      AxisLegendFillerAllData,
      AxisLegendFillerX,
      AxisLegendFillerY,
      AxisLegendFillerXY,
    ];
    let title = "";
    if (this.count !== 0) {
      title = "Excluded less thans from plot: " + this.count
    }
    var layout = {
      title: title,
      dragmode: 'lasso',
      font: {
        size: 14,
      },
      xaxis: {
        autotick: this.autotickEnabled,
        type: this.xAxisType,
        title: {
          text: this.xAxisTitle,
          font: {
            size: 18,
          },
        },
      },
      yaxis: {
        autotick: this.autotickEnabled,
        type: this.yAxisType,
        title: {
          text: this.yAxisTitle,
          font: {
            size: 18,
          },
        },
      },
      paper_bgcolor: 'rgba(255, 255, 255, 0)',
      plot_bgcolor: 'rgba(255, 255, 255, 0)',
      showlegend: true,
      legend: {
        bgcolor: 'rgba(255, 255, 255, 0)',
        title: { text: 'Flagged Data' },
        font: { size: 14 },
      },
      modebar: { bgcolor: 'rgba(255, 255, 255, 0)' },
      height: this.graphHeight,
      width: this.graphWidth,
      margin: {
        l: this.graphMargins,
        r: this.graphMargins,
        t: this.graphMargins,
        b: this.graphMargins,
      },
    };
    // custom button icons
    var flagIcon = {
      width: 500,
      height: 600,
      path: 'M64 32V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V32C0 14.3 14.3 0 32 0S64 14.3 64 32zm40.8 302.8c-3 .9-6 1.7-8.8 2.6V13.5C121.5 6.4 153 0 184 0c36.5 0 68.3 9.1 95.6 16.9l1.3 .4C309.4 25.4 333.3 32 360 32c26.8 0 52.9-6.8 73-14.1c9.9-3.6 17.9-7.2 23.4-9.8c2.7-1.3 4.8-2.4 6.2-3.1c.7-.4 1.1-.6 1.4-.8l.2-.1c9.9-5.6 22.1-5.6 31.9 .2S512 20.6 512 32V288c0 12.1-6.8 23.2-17.7 28.6L480 288c14.3 28.6 14.3 28.6 14.3 28.6l0 0 0 0-.1 0-.2 .1-.7 .4c-.6 .3-1.5 .7-2.5 1.2c-2.2 1-5.2 2.4-9 4c-7.7 3.3-18.5 7.6-31.5 11.9C424.5 342.9 388.8 352 352 352c-37 0-65.2-9.4-89-17.3l-1-.3c-24-8-43.7-14.4-70-14.4c-27.5 0-60.1 7-87.2 14.8z',
    };
    var removeIcon = {
      width: 500,
      height: 600,
      path: 'M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM512 256c0 141.4-114.6 256-256 256S0 397.4 0 256S114.6 0 256 0S512 114.6 512 256z',
    };
    var downloadIcon = {
      width: 700,
      height: 600,
      path: 'M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128H144zm79-167l80 80c9.4 9.4 24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-39 39V184c0-13.3-10.7-24-24-24s-24 10.7-24 24V318.1l-39-39c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9z',
    };

    //build the graph
    Plotly.newPlot(this.bivariatePlot, data, layout, {
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['select', 'resetscale', 'zoomin', 'zoomout'],
      modeBarButtonsToAdd: [
        {
          name: 'Flag all',
          icon: flagIcon,
          click: (e) => {
            this.flagAllData();
          },
        },
        {
          name: 'Remove plotted flags',
          icon: removeIcon,
          click: (e) => {
            this.unflagAllData();
          },
        },
        {
          name: 'Download plotted data',
          icon: downloadIcon,
          click: (e) => {
            this.downloadAllGraphData();
          },
        },
      ],
    }),
      this.initiateSelectPoints();
  }

  flagAllData() {
    this.flagAll = true;
    this.showFlagOptions = true;
    this.disableEnableGraph(true);
    this.selectPoints();
  }

  //Creates html for the accessible form for selecting databases
  buildAccessibleDatabase() {
    let databaseHTML = '';

    //Create a checkbox for each of database option
    for (let i = 0; i < this.databaseChoices.length; i++) {
      databaseHTML +=
        "<input id='" +
        'database' +
        i +
        "' type='checkbox'><label for='" +
        'database' +
        i +
        "'>" +
        this.databaseChoices[i].name +
        '</label><br>';
    }

    //Insert the checkbox html into the database fieldset
    document.getElementById('databaseCheckboxGraph').innerHTML = databaseHTML;
  }

  databaseCheckboxes(clear: Boolean) {
    //Find number of databases listed in the fieldset
    let numDatabaseOptions = this.databaseChoices.length;
    //To be populated with code from each checked database
    let selectedDatabase = [];
    for (let i = 0; i < numDatabaseOptions; i++) {
      //Get the ID of each database
      let databaseID = 'database' + i.toString();
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
    this.graphSelectionsForm.get('Database').setValue(selectedDatabase);
  }

  buildAccessibleMethods(axis: string) {
    let xMethodsHTML = '';
    let yMethodsHTML = '';

    //Create a checkbox for each of database option
    if (axis === 'xaxis') {
      for (let i = 0; i < this.matchingMcodesX.length; i++) {
        xMethodsHTML +=
          "<input id='" +
          'xmethods' +
          i +
          "' type='radio' name='xMethodRadio'><label for='" +
          'xmethods' +
          i +
          "'>" +
          this.matchingMcodesX[i].short_name +
          '</label><br>';
      }
      if (xMethodsHTML == '') {
        xMethodsHTML = 'Select a parameter first';
      }
      //Insert the checkbox html into the fieldset
      document.getElementById('xMethodCheckboxGraph').innerHTML = xMethodsHTML;
    }
    if (axis === 'yaxis') {
      for (let i = 0; i < this.matchingMcodesY.length; i++) {
        yMethodsHTML +=
          "<input id='" +
          'ymethods' +
          i +
          "' type='radio' name='yMethodRadio'><label for='" +
          'ymethods' +
          i +
          "'>" +
          this.matchingMcodesY[i].short_name +
          '</label><br>';
      }
      if (yMethodsHTML == '') {
        yMethodsHTML = 'Select a parameter first';
      }
      //Insert the checkbox html into the fieldset
      document.getElementById('yMethodCheckboxGraph').innerHTML = yMethodsHTML;
    }
  }

  methodGraph(axis: String, clear: Boolean) {
    //Find number of methods listed in the fieldset
    let numOptions: number;

    if (axis == 'x') {
      numOptions = this.matchingMcodesX.length;
    }
    if (axis == 'y') {
      numOptions = this.matchingMcodesY.length;
    }
    //To be populated with code from each checked method
    let selectedMethods;
    for (let i = 0; i < numOptions; i++) {
      //Get the ID of each method
      let methodID: string;
      if (axis == 'x') {
        methodID = 'xmethods' + i.toString();
      }
      if (axis == 'y') {
        methodID = 'ymethods' + i.toString();
      }
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
          if (axis == 'x') {
            //If checked, add code to the selectedDatabase array
            selectedMethods = this.matchingMcodesX[i].mcode;
          }
          if (axis == 'y') {
            //If checked, add code to the selectedDatabase array
            selectedMethods = this.matchingMcodesY[i].mcode;
          }
        }
        //Apply selections from the accessible form to the default form
        if (axis == 'x') {
          this.graphSelectionsForm.get('MethodsX').setValue(selectedMethods);
        }
        if (axis == 'y') {
          this.graphSelectionsForm.get('MethodsY').setValue(selectedMethods);
        }
      }
    }
  }

  unflagAllData() {
    this.unflagAll = true;
    this.showUnflagOptions = true;
    this.disableEnableGraph(true);
    this.selectPoints();
  }

  diffYflags(event) {
    if (event.checked) {
      this.differentYflags = true;
    }
    if (!event.checked) {
      this.differentYflags = false;
    }
  }

  public stringArray(flagString: String) {
    let flagArray: String[] = null;
    flagArray = flagString.split('; ');
    return flagArray;
  }

  closeFlagOptions() {
    //Unfreeze graph and sidebar
    this.disableEnableGraph(false);
    this.disableEnable('graph', true, false);
    this.disableEnable('graphOptionsBackgroundID', true, false);

    //Hide all flag option modals
    this.showFlagOptions = false;
    this.showFlagOptionsX = false;
    this.showFlagOptionsY = false;
    this.showUnflagOptions = false;
    this.onlyYflags = false;

    //If lasso was used, redraw graph to reset color display
    if (this.lasso) {
      this.createGraph(false);
      this.lasso = false;
    }

    //Reset single flag designation
    this.singlePointSelected = false;

    //Reset boolean that controls flagging all data at once
    this.flagAll = false;

    //Reset x-axis/y-axis selection form
    this.axisFlagForm.get('xFlagControl').setValue(null);
    this.axisFlagForm.get('yFlagControl').setValue(null);
    this.axisFlagForm.get('xyFlagControl').setValue(null);

    //Reset flag types x selection form
    this.flagTypesX.get('centralTendency').setValue(null);
    this.flagTypesX.get('outlier').setValue(null);
    this.flagTypesX.get('matrixInterference').setValue(null);
    this.flagTypesX.get('dissolvedGTTotal').setValue(null);
    this.flagTypesX.get('phytoChl').setValue(null);
    this.flagTypesX.get('unknown').setValue(null);

    //Reset flag types y selection form
    this.flagTypesY.get('centralTendency').setValue(null);
    this.flagTypesY.get('outlier').setValue(null);
    this.flagTypesY.get('matrixInterference').setValue(null);
    this.flagTypesY.get('dissolvedGTTotal').setValue(null);
    this.flagTypesY.get('phytoChl').setValue(null);
    this.flagTypesY.get('unknown').setValue(null);

    //Reset option to choose different y-axis flag types
    this.sameXYFlag.get('diffY').setValue(null);
    this.differentYflags = false;

    //Reset the user input for x and y flag annotations
    let inputX = document.getElementById(
      'flagAnnotationX'
    ) as HTMLInputElement | null;
    if (inputX.value) {
      inputX.value = '';
    }
    let inputY = document.getElementById(
      'flagAnnotationY'
    ) as HTMLInputElement | null;
    if (inputY.value) {
      inputY.value = '';
    }
  }

  //Disables or enables clickable features
  //If it's a button, disabling it disables click and turns gray
  //If it's not a button, just disables click
  public disableEnable(element: string, enable: Boolean, button: Boolean) {
    let feature = document.getElementById(element);
    if (enable && button) {
      feature.classList.remove('disabledDataBtn');
    }
    if (!enable && button) {
      feature.classList.add('disabledDataBtn');
    }
    if (enable && !button) {
      feature.classList.remove('disableClick');
    }
    if (!enable && !button) {
      feature.classList.add('disableClick');
    }
  }

  public disableEnableGraph(enable: boolean) {
    // disable pointer events based on if the show flags button is open
    const plotlyjs = document.getElementsByClassName('js-plotly-plot');
    for (let el in plotlyjs) {
      if (plotlyjs[el]['style'] !== undefined && enable) {
        plotlyjs[el]['style'].pointerEvents = 'unset';
      } else if (plotlyjs[el]['style'] !== undefined && !enable) {
        plotlyjs[el]['style'].pointerEvents = 'none';
        plotlyjs[0]['style'].pointerEvents = 'unset'; // re-enables modebar
      }
    }

    const mainSVG = document.getElementsByClassName('main-svg');
    for (let el in mainSVG) {
      if (mainSVG[el]['style'] !== undefined && enable) {
        mainSVG[el]['style'].pointerEvents = 'unset';
      } else if (mainSVG[el]['style'] !== undefined && !enable) {
        mainSVG[el]['style'].pointerEvents = 'none';
      }
    }
  }

  //Called whenever a flag is selected/deselected
  updateGraph(
    color: String,
    axis: String,
    symbol: String,
    border: Number,
    size: Number,
    flagTypesX,
    flagTypesY,
    annotationX: String,
    annotationY: String
  ) {
    let updateGraphCalled = true;
    let colors = this.allColors;
    let symbols = this.allShapes;
    let borders = this.allBorderWidths;
    let sizes = this.allSizes;
    let numPts;

    //If flagAll button is clicked, need to get attributes outside of Plotly
    if (this.flagAll || this.unflagAll) {
      numPts = this.currentXaxisValues.length;
    }
    if (!this.flagAll && !this.unflagAll) {
      numPts = this.selectedPoints.length;
    }

    for (let i = 0; i < numPts; i++) {
      let existingDupX = false;
      let existingDupY = false;
      let pointIndex;
      let selectedColor;
      if (!this.flagAll && !this.unflagAll) {
        pointIndex = this.selectedPoints[i].pointIndex;
        selectedColor = this.selectedPoints[i]['marker.color'];
      }
      if (this.flagAll || this.unflagAll) {
        //If flagging all points, we'll be looping through every point index
        pointIndex = i;
        //Get current point color to check for duplicates
        selectedColor = this.allColors[i];
      }

      //Used for preventing flag duplicates
      if (selectedColor == this.xyFlaggedColor) {
        existingDupX = true;
        existingDupY = true;
      }
      if (selectedColor == this.xFlaggedColor) {
        existingDupX = true;
      }
      if (selectedColor == this.yFlaggedColor) {
        existingDupY = true;
      }
      //Change the color of the point at the correct index (according to x-axis, y-axis, or both selection)
      colors[pointIndex] = color;
      //Change the symbol of the point at the correct index (flagged pts become filled circles; unflagged becomes hollow circle)
      symbols[pointIndex] = symbol;
      borders[pointIndex] = border;
      sizes[pointIndex] = size;

      //if only the x-axis is selected, make sure the y-value at that point isn't in the flaggedData array
      //if neither are selected, ensure that neither are in the flaggedData array
      if (axis == 'x' || axis == 'none') {
        if (this.flaggedData) {
          this.graphSelectionsService.allGraphDataYSubject.subscribe(
            (ydata) => {
              if (updateGraphCalled) {
                let pointToRemove = ydata[pointIndex];
                let rcodeToRemove = pointToRemove.rcode;
                for (let i = 0; i < this.flaggedData.length; i++) {
                  if (rcodeToRemove == this.flaggedData[i].rcode) {
                    this.flaggedData.splice(i, 1);
                    this.graphSelectionsService.flagsSubject.next(
                      this.flaggedData
                    );
                  }
                }
              }
            }
          );
        }
      }
      //if only the y-axis is selected, make sure the x-value at that point isn't in the flaggedData array
      //if neither are selected, ensure that neither are in the flaggedData array
      if (axis == 'y' || axis == 'none') {
        this.graphSelectionsService.allGraphDataXSubject.subscribe((xdata) => {
          if (updateGraphCalled) {
            let pointToRemove = xdata[pointIndex];
            let rcodeToRemove = pointToRemove.rcode;
            for (let i = 0; i < this.flaggedData.length; i++) {
              if (rcodeToRemove == this.flaggedData[i].rcode) {
                this.flaggedData.splice(i, 1);
                this.graphSelectionsService.flagsSubject.next(this.flaggedData);
              }
            }
          }
        });
      }

      let tempData;
      if (axis == 'x' || axis == 'both') {
        //Get all of the data corresponding with the flagged point
        this.graphSelectionsService.allGraphDataXSubject.subscribe((data) => {
          if (updateGraphCalled) {
            tempData = data;
            let newFlag = tempData[pointIndex];
            for (let i = 0; i < this.parameterTypes.length; i++) {
              if (newFlag.pcode == this.parameterTypes[i].pcode) {
                newFlag['parameterName'] = this.parameterTypes[i].short_name;
              }
            }
            for (let j = 0; j < this.mcodeShortName.length; j++) {
              if (newFlag.mcode == this.mcodeShortName[j].mcode) {
                newFlag['methodName'] = this.mcodeShortName[j].short_name;
              }
            }
            newFlag['flagType'] = flagTypesX;
            newFlag['annotation'] = annotationX;
            if (!existingDupX) {
              this.flaggedData.push(tempData[pointIndex]);
              this.graphSelectionsService.flagsSubject.next(this.flaggedData);
            }
          }
        });
      }
      if (axis == 'y' || axis == 'both') {
        //Get all of the data corresponding with the flagged point
        this.graphSelectionsService.allGraphDataYSubject.subscribe((data) => {
          if (updateGraphCalled) {
            tempData = data;
            let newFlag = tempData[pointIndex];
            for (let i = 0; i < this.parameterTypes.length; i++) {
              if (newFlag.pcode == this.parameterTypes[i].pcode) {
                newFlag['parameterName'] = this.parameterTypes[i].short_name;
              }
            }
            for (let j = 0; j < this.mcodeShortName.length; j++) {
              if (newFlag.mcode == this.mcodeShortName[j].mcode) {
                newFlag['methodName'] = this.mcodeShortName[j].short_name;
              }
            }
            newFlag['flagType'] = flagTypesY;
            newFlag['annotation'] = annotationY;
            if (!existingDupY) {
              this.flaggedData.push(tempData[pointIndex]);
              this.graphSelectionsService.flagsSubject.next(this.flaggedData);
            }
          }
        });
      }
    }

    this.allColors = colors;
    this.allShapes = symbols;
    this.allBorderWidths = borders;
    this.allSizes = sizes;

    //If only one point was selected, do not need to re-create graph
    if (!this.singlePointSelected) {
      this.createGraph(false);
    } else {
      //New styling for new plot
      let update = {
        marker: {
          size: this.allSizes,
          color: this.allColors,
          symbol: this.allShapes,
          line: {
            color: this.pointBorderColor,
            width: this.allBorderWidths,
          },
        },
      };
      Plotly.restyle('graph', update, [1]);
    }

    // storing the cyanFlags in browser local storage
    localStorage.setItem('cyanFlags', JSON.stringify(this.flaggedData));

    updateGraphCalled = false;
    this.lasso = false;
    this.flagAll = false;
    this.unflagAll = false;
  }

  public selectText() {
    const input = document.getElementById('text-box');
    input.focus();
  }

  sumbitUnflagSelections() {
    this.updateGraph(
      this.unflaggedColor,
      'none',
      this.unflaggedSymbol,
      this.unflaggedBorderWidth,
      this.unflaggedSize,
      ', ',
      ',',
      ',',
      ','
    );
    this.showUnflagOptions = false;
    // clearing from local storage
    localStorage.removeItem('cyanFlags');
    this.closeFlagOptions();
  }

  //Disable/enable 'Next' button depending on whether or not an axis is checked
  public xyFlagClicked() {
    let xChecked = this.axisFlagForm.get('xFlagControl').value;
    let yChecked = this.axisFlagForm.get('yFlagControl').value;
    let xyChecked = this.axisFlagForm.get('xyFlagControl').value;

    if (xChecked || yChecked || xyChecked) {
      this.disableEnable('continueToFlagOptions', true, true);
      this.noFlagsSelected = false;
    } else {
      this.disableEnable('continueToFlagOptions', false, true);
      this.noFlagsSelected = true;
    }
  }

  public goToFlagTypes() {
    let xChecked = this.axisFlagForm.get('xFlagControl').value;
    let yChecked = this.axisFlagForm.get('yFlagControl').value;
    let xyChecked = this.axisFlagForm.get('xyFlagControl').value;
    this.showFlagOptions = false;

    if (xChecked || xyChecked) {
      this.showFlagOptionsX = true;
    }
    if (!xChecked && !xyChecked && yChecked) {
      this.onlyYflags = true;
      this.showFlagOptionsY = true;
    }
    if (yChecked) {
      this.submitAfterX = false;
    }
    if (!yChecked) {
      this.submitAfterX = true;
    }

    setTimeout(() => {
      document.getElementById('flagModals').style.height = 'auto';
      this.maxFlagModalHeight =
        document.getElementById('flagModals').clientHeight - 20;
      this.resizeDivs(false);
    }, 1);
  }

  public goToFlagTypesY() {
    this.showFlagOptionsX = false;
    this.showFlagOptionsY = true;

    this.maxFlagModalHeight =
      document.getElementById('flagModals').clientHeight;

    setTimeout(() => {
      document.getElementById('flagModals').style.height = 'auto';
      this.maxFlagModalHeight =
        document.getElementById('flagModals').clientHeight - 20;
      this.resizeDivs(true);
    }, 1);
  }

  public getAnnotation(axis: String) {
    let annotation = '';
    let input;
    if (axis == 'x') {
      input = document.getElementById(
        'flagAnnotationX'
      ) as HTMLInputElement | null;
    }
    if (axis == 'y') {
      input = document.getElementById(
        'flagAnnotationY'
      ) as HTMLInputElement | null;
    }
    annotation = input?.value;
    annotation = annotation.replace(/,/g, ';');

    return annotation;
  }

  //Triggered when the 'Submit' button is clicked in the flag modal
  submitFlagSelections() {
    //Capture user input in the annotation box
    let annotationX = this.getAnnotation('x');
    let annotationY;
    let flagTypesX = this.flagTypes('x');
    let flagTypesY;
    //if user chose different flag types for the y-axis, get responses from form
    if (this.differentYflags || this.onlyYflags) {
      flagTypesY = this.flagTypes('y');
      annotationY = this.getAnnotation('y');
    }
    this.stringArray(flagTypesX);
    //if user chose to use the same responses for both axes, duplicate x responses
    if (!this.differentYflags && !this.onlyYflags) {
      flagTypesY = flagTypesX;
      annotationY = annotationX;
    }
    if (!this.sameQuery) {
      let xChecked = this.axisFlagForm.get('xFlagControl').value;
      let yChecked = this.axisFlagForm.get('yFlagControl').value;

      if (xChecked && yChecked) {
        this.updateGraph(
          this.xyFlaggedColor,
          'both',
          this.xySymbol,
          this.flaggedBorderWidth,
          this.flaggedSize,
          flagTypesX,
          flagTypesY,
          annotationX,
          annotationY
        );
      }
      //Y checked; x not checked
      if (yChecked && !xChecked) {
        this.updateGraph(
          this.yFlaggedColor,
          'y',
          this.ySymbol,
          this.flaggedBorderWidth,
          this.flaggedSize,
          flagTypesX,
          flagTypesY,
          annotationX,
          annotationY
        );
      }

      //X checked; Y not checked
      if (!yChecked && xChecked) {
        this.updateGraph(
          this.xFlaggedColor,
          'x',
          this.xSymbol,
          this.flaggedBorderWidth,
          this.flaggedSize,
          flagTypesX,
          flagTypesY,
          annotationX,
          annotationY
        );
      }

      //Neither X nor y checked
      if (!yChecked && !xChecked) {
        this.updateGraph(
          this.unflaggedColor,
          'none',
          this.unflaggedSymbol,
          this.unflaggedBorderWidth,
          this.unflaggedSize,
          flagTypesX,
          flagTypesY,
          annotationX,
          annotationY
        );
      }
    }
    if (this.sameQuery) {
      let xyChecked = this.axisFlagForm.get('xyFlagControl').value;
      //Since x and y are identical, only add x data to the flags
      if (xyChecked) {
        this.updateGraph(
          this.xyFlaggedColor,
          'x',
          this.xySymbol,
          this.flaggedBorderWidth,
          this.flaggedSize,
          flagTypesX,
          flagTypesY,
          annotationX,
          annotationY
        );
      } else {
        this.updateGraph(
          this.unflaggedColor,
          'none',
          this.unflaggedSymbol,
          this.unflaggedBorderWidth,
          this.unflaggedSize,
          flagTypesX,
          flagTypesY,
          annotationX,
          annotationY
        );
      }
    }

    //Close flag modal and clear selections
    this.closeFlagOptions();
  }

  public flagTypes(axis: String) {
    //All flag type options
    let centralTendency;
    let outlier;
    let matrixInterference;
    let dissolvedGTTotal;
    let phytoChl;
    let unknown;

    //Get x flag types
    if (axis == 'x') {
      centralTendency = this.flagTypesX.get('centralTendency').value;
      outlier = this.flagTypesX.get('outlier').value;
      matrixInterference = this.flagTypesX.get('matrixInterference').value;
      dissolvedGTTotal = this.flagTypesX.get('dissolvedGTTotal').value;
      phytoChl = this.flagTypesX.get('phytoChl').value;
      unknown = this.flagTypesX.get('unknown').value;
    }

    //Get y flag types
    if (axis == 'y') {
      centralTendency = this.flagTypesY.get('centralTendency').value;
      outlier = this.flagTypesY.get('outlier').value;
      matrixInterference = this.flagTypesY.get('matrixInterference').value;
      dissolvedGTTotal = this.flagTypesY.get('dissolvedGTTotal').value;
      phytoChl = this.flagTypesY.get('phytoChl').value;
      unknown = this.flagTypesY.get('unknown').value;
    }

    //Convert flag types selections into a string for the csv
    let flagTypes = '';
    if (centralTendency) {
      flagTypes += 'Central tendency; ';
    }
    if (outlier) {
      flagTypes += 'Outlier; ';
    }
    if (matrixInterference) {
      flagTypes += 'Matrix or recovery problem; ';
    }
    if (dissolvedGTTotal) {
      flagTypes += 'Dissolved result > Total; ';
    }
    if (phytoChl) {
      flagTypes += 'Phytoplankton vs Chl; ';
    }
    if (unknown) {
      flagTypes += 'Unknown; ';
    }

    //remove final semicolon and space
    flagTypes = flagTypes.slice(0, -2);

    //Return string of all selected flag types for one axis
    return flagTypes;
  }

  public initiateSelectPoints() {
    this.bivariatePlot.on('plotly_click', (selectedPoints) => {
      this.singlePointSelected = true;
      this.selectPoints();
      //If there is a flag at the selected point, pre-check the boxes in the flag options modal
      this.axisFlagFormCheckBoxes(selectedPoints.points);
      this.selectedPoints = selectedPoints.points;
      //Open flag options modal
      this.showFlagOptions = true;
      this.disableEnableGraph(true);
    });
    this.bivariatePlot.on('plotly_selected', (selectedPoints) => {
      if (selectedPoints) {
        this.singlePointSelected = false;
        this.selectedPoints = selectedPoints.points;
        //Open flag options modal
        this.showFlagOptions = true;
        this.lasso = true;
        this.selectPoints();
        this.disableEnableGraph(true);
        this.xyFlagClicked();
      }
    });
  }

  public selectPoints() {
    document.getElementById('flagModals').style.height = 'auto';
    //Prevent user from clicking on features outside the modal
    this.disableEnable('graph', false, false);
    this.disableEnable('graphOptionsBackgroundID', false, false);

    //Get original flag modal height
    setTimeout(() => {
      this.maxFlagModalHeight =
        document.getElementById('flagModals').clientHeight - 20;
      this.resizeDivs(false);
    }, 1);
  }

  //If there is a flag at the selected point, pre-check the boxes in the flag options modal
  public axisFlagFormCheckBoxes(selectedPoints) {
    let selectedColor = selectedPoints[0]['marker.color'];
    if (selectedColor == this.xyFlaggedColor && !this.sameQuery) {
      //check both boxes
      this.axisFlagForm.get('xFlagControl').setValue(true);
      this.axisFlagForm.get('yFlagControl').setValue(true);
      this.autoCheckFlagTypes('x', selectedPoints);
      this.autoCheckFlagTypes('y', selectedPoints);
    }
    if (selectedColor == this.xyFlaggedColor && this.sameQuery) {
      this.axisFlagForm.get('xyFlagControl').setValue(true);
      this.autoCheckFlagTypes('x', selectedPoints);
      this.autoCheckFlagTypes('y', selectedPoints);
    }
    if (selectedColor == this.xFlaggedColor) {
      //check the x box
      this.axisFlagForm.get('xFlagControl').setValue(true);
      this.autoCheckFlagTypes('x', selectedPoints);
    }
    if (selectedColor == this.yFlaggedColor) {
      //check the y box
      this.axisFlagForm.get('yFlagControl').setValue(true);
      this.autoCheckFlagTypes('y', selectedPoints);
    }
    //Disable/enable 'Next' button depending on whether or not an axis is checked
    this.xyFlagClicked();
  }

  autoCheckFlagTypes(axis: String, selectedPoints) {
    if (axis === 'x') {
      this.graphSelectionsService.allGraphDataXSubject.subscribe((xdata) => {
        let selectedRcodeX = xdata[selectedPoints[0].pointIndex].rcode;
        for (let i = 0; i < this.flaggedData.length; i++) {
          if (this.flaggedData[i].rcode == selectedRcodeX) {
            let currentAnnotation = this.flaggedData[i].annotation;
            let insertAnnotation = document.getElementById(
              'flagAnnotationX'
            ) as HTMLInputElement | null;
            insertAnnotation.value = currentAnnotation;
            let currentFlagType = this.flaggedData[i].flagType;
            let flagArray = this.stringArray(currentFlagType);
            if (flagArray) {
              for (let j = 0; j < flagArray.length; j++) {
                if (flagArray[j] == 'Central tendency') {
                  this.flagTypesX.get('centralTendency').setValue(true);
                }
                if (flagArray[j] == 'Outlier') {
                  this.flagTypesX.get('outlier').setValue(true);
                }
                if (flagArray[j] == 'Matrix or recovery problem') {
                  this.flagTypesX.get('matrixInterference').setValue(true);
                }
                if (flagArray[j] == 'Dissolved result > Total') {
                  this.flagTypesX.get('dissolvedGTTotal').setValue(true);
                }
                if (flagArray[j] == 'Phytoplankton vs Chl') {
                  this.flagTypesX.get('phytoChl').setValue(true);
                }
                if (flagArray[j] == 'Unknown') {
                  this.flagTypesX.get('unknown').setValue(true);
                }
              }
            }
          }
        }
      });
    }
    if (axis === 'y') {
      this.graphSelectionsService.allGraphDataYSubject.subscribe((ydata) => {
        let selectedRcodeY = ydata[selectedPoints[0].pointIndex].rcode;
        for (let i = 0; i < this.flaggedData.length; i++) {
          if (this.flaggedData[i].rcode == selectedRcodeY) {
            let currentAnnotation = this.flaggedData[i].annotation;
            let insertAnnotation = document.getElementById(
              'flagAnnotationY'
            ) as HTMLInputElement | null;
            insertAnnotation.value = currentAnnotation;
            let currentFlagType = this.flaggedData[i].flagType;
            let flagArray = this.stringArray(currentFlagType);
            if (flagArray) {
              for (let j = 0; j < flagArray.length; j++) {
                if (flagArray[j] == 'Central tendency') {
                  this.flagTypesY.get('centralTendency').setValue(true);
                }
                if (flagArray[j] == 'Outlier') {
                  this.flagTypesY.get('outlier').setValue(true);
                }
                if (flagArray[j] == 'Matrix or recovery problem') {
                  this.flagTypesY.get('matrixInterference').setValue(true);
                }
                if (flagArray[j] == 'Dissolved result > Total') {
                  this.flagTypesY.get('dissolvedGTTotal').setValue(true);
                }
                if (flagArray[j] == 'Phytoplankton vs Chl') {
                  this.flagTypesY.get('phytoChl').setValue(true);
                }
                if (flagArray[j] == 'Unknown') {
                  this.flagTypesY.get('unknown').setValue(true);
                }
              }
            }
          }
        }
      });
    }
  }

  //Called when user clicks 'Plot Data'
  public clickPlotData() {
    //Whenever user attempts to create a new graph, clear previous one even if it's a failed query
    this.showGraph = false;
    this.alreadyGraphed = false;
    //Get parameter and method user selections
    let tempP_X_value = this.graphSelectionsForm.get('ParametersX').value;
    let tempP_Y_value = this.graphSelectionsForm.get('ParametersY').value;
    let tempM_X = this.graphSelectionsForm.get('MethodsX').value;
    let tempM_Y = this.graphSelectionsForm.get('MethodsY').value;

    let org = this.graphSelectionsForm.get('Database').value;
    //If all databases are selected, submit 0
    //Otherwise, submit the first (only) one from the array
    if (org) {
      if (org.length == 0) {
        org = null;
      }
    }

    //If any parameter or method is left blank, prompt user to make a selection
    if (
      tempP_X_value === null ||
      tempP_Y_value === null ||
      tempM_X == null ||
      tempM_Y == null ||
      org == null
    ) {
      this.snackBar.open(
        'Please select a database and a parameter & method for each axis.',
        'OK',
        {
          duration: 4000,
          verticalPosition: 'top',
        }
      );
    } else {
      //Add the WIM loader while graph is being created
      let base = document.getElementById('base');
      base.classList.add('initial-loader');
      this.disableEnable('graphOptionsBackgroundID', false, false);
      this.disableEnable('graphDataDownloadBtn', false, true);
      this.showGraph = false;
      this.populateGraphData();
      this.resizeDivs(true);

      //minimize graph options panel if the screen width is small
      let windowWidth = window.innerWidth;
      if (windowWidth < 900) {
        this.collapseGraphOptions(false);
      }
    }

    //Discard old parameter indices when a new graph is generated
    if (this.flaggedPointIndices.x) {
      this.flaggedPointIndices.x = [];
    }
    if (this.flaggedPointIndices.y) {
      this.flaggedPointIndices.y = [];
    }
  }

  //retrieve data from service and put it in a format that can be used to populate graph
  public populateGraphData() {
    this.createQuery('xAxis');
    this.createQuery('yAxis');
    //getTempArrays retrieves the x and y data from the service, whereas filterGraphPoints matches x-y coordinates and returns data ready to be plotted
    this.graphSelectionsService.getTempArrays(this.filterQueryX, 'xAxis');
    this.graphSelectionsService.getTempArrays(this.filterQueryY, 'yAxis');
  }

  //Called when user checks or unchecks x-axis log box
  public applyLogX(logXChecked: MatCheckboxChange) {
    if (logXChecked.checked) {
      this.xAxisType = 'log';
    } else {
      this.xAxisType = 'scatter';
    }
  }

  //Called when user checks or unchecks y-axis log box
  public applyLogY(logYChecked: MatCheckboxChange) {
    if (logYChecked.checked) {
      this.yAxisType = 'log';
    } else {
      this.yAxisType = 'scatter';
    }
  }

  //Get bounding box and region selection from map options
  public applyBoundingBox(boundingBoxChecked: MatCheckboxChange) {
    //Map options bounding box selections
    if (boundingBoxChecked.checked) {
      this.useBoundingBox = true;
      this.componentDisplayService.storeNorthSubject.subscribe((coordinate) => {
        if (coordinate) {
          this.north = coordinate;
        }
      });
      this.componentDisplayService.storeSouthSubject.subscribe((coordinate) => {
        if (coordinate) {
          this.south = coordinate;
        }
      });
      this.componentDisplayService.storeEastSubject.subscribe((coordinate) => {
        if (coordinate) {
          this.east = coordinate;
        }
      });
      this.componentDisplayService.storeWestSubject.subscribe((coordinate) => {
        if (coordinate) {
          this.west = coordinate;
        }
      });
      //Map option region selection
      this.componentDisplayService.storeRegionSubject.subscribe((region) => {
        if (region) {
          this.regions = region;
        }
      });
    } else {
      this.useBoundingBox = false;
    }
  }

  //Called when user checks or unchecks satellite alignment box
  public clickSatAlign(satAlignChecked: MatCheckboxChange) {
    if (satAlignChecked.checked) {
      this.optimalAlignment = true;
    } else {
      this.optimalAlignment = false;
    }
  }

  //formats user selections into an object that's used to retrieve data from the service
  public createQuery(axis: string) {
    //default assumption is that there are different data for x and y values
    this.sameQuery = false;

    let tempP;
    let tempM;

    if (axis == 'xAxis') {
      tempP = this.graphSelectionsForm.get('ParametersX').value.pcode;
      tempM = this.graphSelectionsForm.get('MethodsX').value;
    }
    if (axis == 'yAxis') {
      tempP = this.graphSelectionsForm.get('ParametersY').value.pcode;
      tempM = this.graphSelectionsForm.get('MethodsY').value;
    }

    let org = this.graphSelectionsForm.get('Database').value;
    //If all databases are selected, submit 0
    //Otherwise, submit the first (only) one from the array
    if (org.length == this.databaseChoices.length) {
      org = 0;
    } else {
      org = org[0];
    }

    let items = new Object();
    //Populate the 'items' object (parameters & methods) in the query object
    //Method form is a single-select dropdown, but service requires an array, so add method string to empty array
    let formattedM = [];
    formattedM.push(tempM);
    items[tempP] = formattedM;
    //Populate axes titles
    for (let i = 0; i < this.parameterTypes.length; i++) {
      if (tempP === this.parameterTypes[i].pcode) {
        if (axis === 'yAxis') {
          this.yAxisParameter = this.parameterTypes[i].short_name.toString();
        }
        if (axis === 'xAxis') {
          this.xAxisParameter = this.parameterTypes[i].short_name.toString(); // + " " + this.parameterTypes[i].unit;
        }
      }
    }
    //Create separate query objects for x and y data
    if (axis === 'xAxis') {
      //If the user selected the map bounds, populate with those values and region
      //Otherwise, there are no geographic constraints
      if (this.useBoundingBox) {
        if (this.regions == undefined) {
          this.regions = [];
        }
        this.filterQueryX = {
          meta: {
            north: this.north,
            south: this.south,
            east: this.east,
            west: this.west,
            min_year: this.minYear,
            max_year: this.maxYear,
            include_NULL: false,
            satellite_align: this.optimalAlignment,
            region: this.regions,
            organization: org,
          },
          items,
        };
      } else {
        this.filterQueryX = {
          meta: {
            north: 90,
            south: -90,
            east: 180,
            west: -180,
            min_year: this.minYear,
            max_year: this.maxYear,
            include_NULL: false,
            satellite_align: this.optimalAlignment,
            region: [],
            organization: org,
          },
          items,
        };
      }
    }
    if (axis === 'yAxis') {
      if (this.useBoundingBox) {
        if (this.regions == undefined) {
          this.regions = [];
        }
        this.filterQueryY = {
          meta: {
            north: this.north,
            south: this.south,
            east: this.east,
            west: this.west,
            min_year: this.minYear,
            max_year: this.maxYear,
            include_NULL: false,
            satellite_align: this.optimalAlignment,
            region: this.regions,
            organization: org,
          },
          items,
        };
      } else {
        this.filterQueryY = {
          meta: {
            north: 90,
            south: -90,
            east: 180,
            west: -180,
            min_year: this.minYear,
            max_year: this.maxYear,
            include_NULL: false,
            satellite_align: this.optimalAlignment,
            region: [],
            organization: org,
          },
          items,
        };
      }
    }
    let xQueryString = JSON.stringify(this.filterQueryX);
    let yQueryString = JSON.stringify(this.filterQueryY);
    //check if user selected the exact same options for x and y axes
    if (xQueryString === yQueryString) {
      this.sameQuery = true;
    }
  }

  //creates a csv containing all of the user-defined filters
  public downloadGraphMetadata() {
    let graphMetadataContent = 'data:text/csv;charset=utf-8,';
    //Create and download a csv of the graph metadata
    //The following code was adapted from this example:
    //https://www.delftstack.com/howto/javascript/export-javascript-csv/
    this.graphMetadata.forEach(function (rowArray) {
      let row = rowArray.join(',');
      graphMetadataContent += row + '\r\n';
    });
    let encodedUri = encodeURI(graphMetadataContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'graph_metadata.csv');
    document.body.appendChild(link);
    link.click();
  }

  public downloadAllGraphData() {
    let xData;
    let yData;
    this.graphSelectionsService.downloadGraphDataYSubject.subscribe((ydata) => {
      yData = ydata;
    });
    this.graphSelectionsService.downloadGraphDataXSubject.subscribe((xdata) => {
      xData = xdata;
    });

    let allGraphData = xData.concat(yData);

    this.createCSV(allGraphData, 'plottedData.csv', true);
  }

  createCSV(data, filename, formatDate) {
    if (formatDate) {
      for (let i = 0; i < data.length; i++) {
        let currDate = data[i].date_time_group;
        let formattedDate = moment(currDate).format('MM-DD-YYYY HH:mm:ss');
        data[i]['date_formatted'] = formattedDate;
      }
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    let csv = data.map((row) => Object.values(row));
    csv.unshift(Object.keys(data[0]));
    csvContent += csv.join('\n');
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
  }

  //Every time the window is resized, change size and position of elements accordingly
  public resizeDivs(redrawGraph) {
    //get map height
    let mapContainer = document.getElementById('mapContainer');
    let mapHeight = parseInt(window.getComputedStyle(mapContainer).height);

    //get window width
    let windowWidth = window.innerWidth;

    let graphOptionsBackgroundID = document.getElementById(
      'graphOptionsBackgroundID'
    );
    let graphBackgroundID = document.getElementById('graphBackgroundID');
    let graphOptionsCollapsedID = document.getElementById(
      'graphOptionsCollapsedID'
    );

    let flagModals = document.getElementById('flagModals');

    if (this.maxFlagModalHeight > mapHeight - 140) {
      let newFlagModalHeight = (mapHeight - 140).toString() + 'px';
      flagModals.style.height = newFlagModalHeight;
    } else {
      flagModals.style.height = 'auto';
    }

    this.graphHeight = 0.99 * mapHeight - 110;
    if (!this.showFlagOptions) {
      graphBackgroundID.style.height =
        (0.99 * mapHeight - 110).toString() + 'px';
    }

    if (windowWidth < 900) {
      graphOptionsBackgroundID.classList.remove('marginLeftFullWidth');
      graphOptionsBackgroundID.classList.add('marginLeftSmallWidth');

      graphOptionsCollapsedID.classList.remove('marginLeftFullWidth');
      graphOptionsCollapsedID.classList.add('marginLeftSmallWidth');

      graphOptionsBackgroundID.classList.remove('optionsMarginRightLarge');
      graphOptionsBackgroundID.classList.add('optionsMarginRightSmall');

      if (this.graphOptionsVisible) {
        this.graphWidth = 0.95 * windowWidth - 245;
      }
      if (!this.graphOptionsVisible) {
        this.graphWidth = 0.95 * windowWidth - 65;
      }
    }
    if (windowWidth > 900) {
      graphOptionsBackgroundID.classList.add('marginLeftFullWidth');
      graphOptionsBackgroundID.classList.remove('marginLeftSmallWidth');

      graphOptionsCollapsedID.classList.add('marginLeftFullWidth');
      graphOptionsCollapsedID.classList.remove('marginLeftSmallWidth');

      graphOptionsBackgroundID.classList.add('optionsMarginRightLarge');
      graphOptionsBackgroundID.classList.remove('optionsMarginRightSmall');

      if (this.graphOptionsVisible) {
        this.graphWidth = 0.8 * windowWidth - 400;
      }
      if (!this.graphOptionsVisible) {
        this.graphWidth = 0.8 * windowWidth - 165;
      }
    }
    if (mapHeight < 570) {
      graphOptionsBackgroundID.classList.remove('marginTopFullHeight');
      graphOptionsBackgroundID.classList.add('marginTopSmallHeight');

      graphBackgroundID.classList.remove('marginTopFullHeight');
      graphBackgroundID.classList.add('marginTopSmallHeight');

      graphOptionsCollapsedID.classList.remove('marginTopFullHeight');
      graphOptionsCollapsedID.classList.add('marginTopSmallHeight');

      graphOptionsBackgroundID.style.height =
        (mapHeight - 85).toString() + 'px';
    }
    if (mapHeight > 570) {
      graphOptionsBackgroundID.classList.add('marginTopFullHeight');
      graphOptionsBackgroundID.classList.remove('marginTopSmallHeight');

      graphBackgroundID.classList.add('marginTopFullHeight');
      graphBackgroundID.classList.remove('marginTopSmallHeight');

      graphOptionsCollapsedID.classList.add('marginTopFullHeight');
      graphOptionsCollapsedID.classList.remove('marginTopSmallHeight');

      graphOptionsBackgroundID.style.height =
        (mapHeight - 105).toString() + 'px';
    }
    if (windowWidth > 1200 && mapHeight > 450) {
      this.graphMargins = 80;
    }
    if (windowWidth < 1200 || mapHeight < 450) {
      //commenting this out for now because shrinking the margins make the axes titles overlap with the tick marks
      //this.graphMargins = 20;
    }

    if (
      this.showGraph &&
      redrawGraph &&
      !this.showFlagOptions &&
      !this.showFlagOptionsX &&
      !this.showFlagOptionsY
    ) {
      this.createGraph(false);
    }
  }

  // filter using typed string
  _filter(name: string) {
    if (name.length == undefined) {
      return this.parameterTypes.filter(
        (parameter) =>
          parameter.short_name
            .toLowerCase()
            .indexOf(name['short_name'].toLowerCase()) === 0
      );
    } else {
      return this.parameterTypes.filter(
        (parameter) =>
          parameter.short_name.toLowerCase().indexOf(name.toLowerCase()) === 0
      );
    }
  }

  // display the select parameter in the select box
  display(selectedoption) {
    if (selectedoption !== null) {
      return selectedoption.short_name ? selectedoption.short_name : '';
    }
  }

  // use min & max year values from map options
  applyDatesFromMap(event) {
    if (event.checked == true) {
      // getting min & max set in map options
      this.filterService.minYear$.subscribe((year) => {
        this.minYear = year;
      });
      this.filterService.maxYear$.subscribe((year) => {
        this.maxYear = year;
      });
    } else {
      // reseting graph min & max but leaving map options observables alone
      // if user checks box it will default to map option again
      this.minYear = 1980;
      this.maxYear = 2021;
    }
  }
  uncheckDatefromMapOptions() {
    this.datefromMap.checked = false;
  }

  //clears selected parameters/form values when 'x' icon is clicked
  clearParameter(axis) {
    if (axis == 'x') {
      this.graphSelectionsForm.get('ParametersX').setValue('');
      this.graphSelectionsForm.get('MethodsX').setValue('');
    } else if (axis == 'y') {
      this.graphSelectionsForm.get('ParametersY').setValue('');
      this.graphSelectionsForm.get('MethodsY').setValue('');
    }
  }

  clearGraph() {
    // resetting forms
    this.graphSelectionsForm.reset();
    this.axisFlagForm.reset();
    this.flagTypesX.reset();
    this.flagTypesY.reset();
    this.sameXYFlag.reset();
    this.matchingMcodesX = [];
    this.matchingMcodesY = [];

    //resetting checkboxes
    this.datefromMap.checked = false;
    let xLogCheckbox = document.getElementById('xLogCheckbox');
    xLogCheckbox.classList.remove('mat-checkbox-checked');
    let yLogCheckbox = document.getElementById('yLogCheckbox');
    yLogCheckbox.classList.remove('mat-checkbox-checked');
    let applyBoundingCheckbox = document.getElementById(
      'applyBoundingCheckbox'
    );
    applyBoundingCheckbox.classList.remove('mat-checkbox-checked');
    let optSatCheckbox = document.getElementById('optSatCheckbox');
    optSatCheckbox.classList.remove('mat-checkbox-checked');

    //resetting graph data
    this.currentXaxisValues = [];
    this.currentYaxisValues = [];
    this.flaggedPointIndices = { x: [], y: [] };
    this.allGraphData;
    this.graphMetadata;

    //resetting graph layout
    this.xAxisType = 'scatter';
    this.yAxisType = 'scatter';
    this.yAxisTitle = '';
    this.xAxisTitle = '';
    this.yAxisParameter = '';
    this.xAxisParameter = '';
    this.xAxisUnits = '';
    this.yAxisUnits = '';

    // resetting graph options
    this.optimalAlignment = false;
    this.useBoundingBox = false;
    this.minYear = 1980;
    this.maxYear = 2021;
    this.timeOptions = {
      floor: 1980,
      ceil: 2021,
      barDimension: 210,
      animate: false,
    };
    this.north = 90;
    this.south = -90;
    this.east = 180;
    this.west = -180;
    this.regions = [];
    this.datefromMapChecked = false;

    // purging the graph and hiding the div
    if (this.bivariatePlot !== undefined) {
      Plotly.purge(this.bivariatePlot);
    }
    if (this.showGraph) {
      this.showGraph = false;
    }

    //Clear accessible forms
    this.databaseCheckboxes(true);
    this.buildAccessibleMethods('xaxis');
    this.buildAccessibleMethods('yaxis');
    this.methodGraph('x', true);
    this.methodGraph('y', true);
  }

  //functions for retrieving mat-tooltip text from config file
  disabledFlagButtonTooltip() {
    const string = TOOLTIPS.disabledFlagButtonTooltip;
    return string;
  }
  clearFiltersTooltip() {
    const string = TOOLTIPS.clearFiltersTooltip;
    return string;
  }
}
