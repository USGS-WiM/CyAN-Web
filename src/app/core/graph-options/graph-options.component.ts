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
  graphSelectionsForm = new FormGroup({
    ParametersX: new FormControl(),
    MethodsX: new FormControl(),
    ParametersY: new FormControl(),
    MethodsY: new FormControl(),
  });
  public optimalAlignment: Boolean = false;
  public useBoundingBox: Boolean = false;
  minYear: number = 1975;
  maxYear: number = 2021;
  timeOptions: Options = {
    floor: 1975,
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
    centralTendency: new FormControl(),
    outlier: new FormControl(),
    matrixInterference: new FormControl(),
    dissolvedGTTotal: new FormControl(),
    phytoChl: new FormControl(),
    unknown: new FormControl(),
  });
  public flags$: Observable<any[]>;
  //Colors for all 4 flagging options
  public unflaggedColor: string = 'rgb(242, 189, 161)';
  public xyFlaggedColor: string = 'rgb(0, 153, 0)';
  public xFlaggedColor: string = 'rgb(255, 0, 255)';
  public yFlaggedColor: string = 'rgb(0, 204, 204)';
  //Symbols for flagged vs unflagged
  public allColors = [];
  public allShapes = [];
  public unflaggedSymbol: string = 'circle-open';
  public flaggedSymbol: string = 'circle';
  public selectedPoints;

  //Intermediate data
  public matchingMcodesY = [];
  public matchingMcodesX = [];

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
  }

  //Adjust the css (via resizeDivs()) when the window is resized
  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    //Set the display according to the initial screen dimensions
    this.resizeDivs();
    this.getDataForDropdowns();
    this.initiateGraphService();
    this.getUnits();
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
      this.xAxisTitle = this.xAxisParameter + ' ' + xUnits;
    });
    this.graphSelectionsService.yAxisUnitsSubject.subscribe((yUnits) => {
      this.yAxisUnits = yUnits;
      this.yAxisTitle = this.yAxisParameter + ' ' + yUnits;
    });
  }

  public initiateGraphService() {
    this.graphSelectionsService.flagsSubject.subscribe((flags) => {
      if (flags) {
        if (flags.length > 0) {
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
        'Include_Null',
        'Region',
        'Optimal_Alignment',
        'X_Parameter',
        'X_Method',
        'Y_Parameter',
        'Y_Method',
        'X_Units',
        'Y_Units',
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
        this.filterQueryX.meta.include_NULL,
        formattedRegion,
        this.filterQueryX.meta.satellite_align,
        this.graphSelectionsForm.get('ParametersX').value.pcode,
        formattedMcodeX,
        this.graphSelectionsForm.get('ParametersY').value.pcode,
        formattedMcodeY,
        this.xAxisUnits,
        this.yAxisUnits,
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
  }

  //Called when minimize options is clicked
  //Shrinks Graph Options panel into a button and expands the graph
  public collapseGraphOptions(collapsed: Boolean) {
    this.graphOptionsVisible = collapsed;
    this.resizeDivs();
  }

  public createGraph(newPlot: Boolean) {
    if (newPlot) {
      this.allColors = this.graphSelectionsService.pointColors;
      this.allShapes = this.graphSelectionsService.pointSymbol;
    }
    //Designate div to put graph
    this.bivariatePlot = document.getElementById('graph');

    var trace1 = {
      x: this.currentXaxisValues,
      y: this.currentYaxisValues,
      mode: 'markers',
      type: 'scatter',
      //Keeping these here so that it's easy to add if we decide to implement in the future
      //name: 'Sample 1',
      //text: this.sid,
      textposition: 'bottom center',
      marker: { size: 12, color: this.allColors, symbol: this.allShapes },
    };

    var data = [trace1];

    var layout = {
      font: {
        size: 18,
      },
      xaxis: {
        autotick: this.autotickEnabled,
        type: this.xAxisType,
        title: {
          text: this.xAxisTitle,
        },
      },
      yaxis: {
        autotick: this.autotickEnabled,
        type: this.yAxisType,
        title: {
          text: this.yAxisTitle,
        },
      },
      paper_bgcolor: 'rgba(255, 255, 255, 0)',
      plot_bgcolor: 'rgba(255, 255, 255, 0)',
      showlegend: false,
      legend: { bgcolor: 'rgba(255, 255, 255, 0)' },
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
          name: 'Flag plotted data',
          icon: flagIcon,
          click: (e) => {
            this.flagAllData();
          },
        },
        {
          name: 'Remove all flags',
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

  unflagAllData() {
    this.unflagAll = true;
    this.showUnflagOptions = true;
    this.selectPoints();
  }

  closeFlagOptions() {
    //Close flag options modal
    this.showFlagOptions = false;
    this.disableEnableGraph(false);
    this.showUnflagOptions = false;
    if (this.lasso) {
      this.createGraph(false);
      this.lasso = false;
    }
    this.flagAll = false;

    //enable all features that were disabled when modal was open
    this.disableEnable('graph', true, false);
    this.disableEnable('graphOptionsBackgroundID', true, false);

    //Reset form
    this.axisFlagForm.get('xFlagControl').setValue(null);
    this.axisFlagForm.get('yFlagControl').setValue(null);
    this.axisFlagForm.get('xyFlagControl').setValue(null);
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
    const modebar = document.getElementsByClassName('modebar-container');
      for (let el in plotlyjs) {
        if ((plotlyjs[el]['style'] !== undefined) && (enable) ) {
          console.log("enable true");
          plotlyjs[el]['style'].pointerEvents = "unset";
        } else if ((plotlyjs[el]['style'] !== undefined) && (!enable) ) {
          console.log(modebar);
          plotlyjs[el]['style'].pointerEvents = "none";
          plotlyjs[0]['style'].pointerEvents = "unset"; // re-enables modebar
        }
      }

      const mainSVG = document.getElementsByClassName('main-svg')
      for (let el in mainSVG) {
        if ((mainSVG[el]['style'] !== undefined) && (enable)) {
          mainSVG[el]['style'].pointerEvents = "unset";
        } else if ((mainSVG[el]['style'] !== undefined) && (!enable) ){
          mainSVG[el]['style'].pointerEvents = "none";
        }
      }
  }

  //Called whenever a flag is selected/deselected
  updateGraph(
    color: String,
    axis: String,
    symbol: String,
    flagTypes,
    annotation: String
  ) {
    let updateGraphCalled = true;
    let colors = this.allColors;
    let symbols = this.allShapes;
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
            tempData[pointIndex]['flagType'] = flagTypes;
            tempData[pointIndex]['annotation'] = annotation;
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
            tempData[pointIndex]['flagType'] = flagTypes;
            tempData[pointIndex]['annotation'] = annotation;
            if (!existingDupY) {
              this.flaggedData.push(tempData[pointIndex]);
              this.graphSelectionsService.flagsSubject.next(this.flaggedData);
            }
          }
        });
      }
    }

    //New styling for new plot
    let update = {
      marker: { color: colors, size: 12, symbol: symbols },
    };

    this.allColors = colors;
    this.allShapes = symbols;

    //Change the color on the graph
    if (!this.lasso) {
      Plotly.restyle('graph', update);
    }
    //Override the default Plotly post-lasso view by re-drawing graph
    if (this.lasso) {
      this.createGraph(false);
    }

    console.log('this.flaggedData', this.flaggedData);
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
    this.updateGraph(this.unflaggedColor, 'none', this.unflaggedSymbol, '', '');
    this.showUnflagOptions = false;
    this.closeFlagOptions();
  }

  //Triggered when the 'Submit' button is clicked in the flag modal
  submitFlagSelections() {
    //Capture user input in the annotation box
    let annotation = '';
    let input = document.getElementById(
      'flagAnnotation'
    ) as HTMLInputElement | null;
    annotation = input?.value;
    annotation = annotation.replace(/,/g, ';');
    let flagTypes = this.flagTypes();
    if (!this.sameQuery) {
      let xChecked = this.axisFlagForm.get('xFlagControl').value;
      let yChecked = this.axisFlagForm.get('yFlagControl').value;

      if (xChecked && yChecked) {
        this.updateGraph(
          this.xyFlaggedColor,
          'both',
          this.flaggedSymbol,
          flagTypes,
          annotation
        );
      }
      //Y checked; x not checked
      if (yChecked && !xChecked) {
        this.updateGraph(
          this.yFlaggedColor,
          'y',
          this.flaggedSymbol,
          flagTypes,
          annotation
        );
      }

      //X checked; Y not checked
      if (!yChecked && xChecked) {
        this.updateGraph(
          this.xFlaggedColor,
          'x',
          this.flaggedSymbol,
          flagTypes,
          annotation
        );
      }

      //Neither X nor y checked
      if (!yChecked && !xChecked) {
        this.updateGraph(
          this.unflaggedColor,
          'none',
          this.unflaggedSymbol,
          flagTypes,
          annotation
        );
      }
      this.flagTypes();
    }
    if (this.sameQuery) {
      let xyChecked = this.axisFlagForm.get('xyFlagControl').value;
      //Since x and y are identical, only add x data to the flags
      if (xyChecked) {
        this.updateGraph(
          this.xyFlaggedColor,
          'x',
          this.flaggedSymbol,
          flagTypes,
          annotation
        );
      } else {
        this.updateGraph(
          this.unflaggedColor,
          'none',
          this.unflaggedSymbol,
          flagTypes,
          annotation
        );
      }
    }

    //Clear annotation form
    if (input.value) {
      input.value = null;
    }
    //Close flag modal and clear selections
    this.closeFlagOptions();
  }

  public flagTypes() {
    let centralTendency = this.axisFlagForm.get('centralTendency').value;
    let outlier = this.axisFlagForm.get('outlier').value;
    let matrixInterference = this.axisFlagForm.get('matrixInterference').value;
    let dissolvedGTTotal = this.axisFlagForm.get('dissolvedGTTotal').value;
    let phytoChl = this.axisFlagForm.get('phytoChl').value;
    let unknown = this.axisFlagForm.get('unknown').value;

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
      flagTypes += 'Unknown';
    }
    this.axisFlagForm.get('centralTendency').setValue(null);
    this.axisFlagForm.get('outlier').setValue(null);
    this.axisFlagForm.get('matrixInterference').setValue(null);
    this.axisFlagForm.get('dissolvedGTTotal').setValue(null);
    this.axisFlagForm.get('phytoChl').setValue(null);
    this.axisFlagForm.get('unknown').setValue(null);
    return flagTypes;
  }

  public initiateSelectPoints() {
    this.bivariatePlot.on('plotly_click', (selectedPoints) => {
      this.selectPoints();
      //If there is a flag at the selected point, pre-check the boxes in the flag options modal
      this.axisFlagFormCheckBoxes(selectedPoints.points);
      this.selectedPoints = selectedPoints.points;
      //Open flag options modal
      this.showFlagOptions = true;
      this.disableEnableGraph(true);
    });
    this.bivariatePlot.on('plotly_selected', (selectedPoints) => {
      this.selectedPoints = selectedPoints.points;
      //Open flag options modal
      this.showFlagOptions = true;
      this.lasso = true;
      this.selectPoints();
      this.disableEnableGraph(true);
    });
  }

  public selectPoints() {
    //Prevent user from clicking on features outside the modal
    this.disableEnable('graph', false, false);
    this.disableEnable('graphOptionsBackgroundID', false, false);
    //Plotly.react(this.bivariatePlot, {}, {'staticPlot': 'true'});
  }

  //If there is a flag at the selected point, pre-check the boxes in the flag options modal
  public axisFlagFormCheckBoxes(selectedPoints) {
    let selectedColor = selectedPoints[0]['marker.color'];
    if (selectedColor == this.xyFlaggedColor) {
      //check both boxes
      this.axisFlagForm.get('xFlagControl').setValue(true);
      this.axisFlagForm.get('yFlagControl').setValue(true);
      this.axisFlagForm.get('xyFlagControl').setValue(true);
    }
    if (selectedColor == this.xFlaggedColor) {
      //check the x box
      this.axisFlagForm.get('xFlagControl').setValue(true);
    }
    if (selectedColor == this.yFlaggedColor) {
      //check the y box
      this.axisFlagForm.get('yFlagControl').setValue(true);
    }
  }

  //Called when user clicks 'Plot Data'
  public clickPlotData() {
    this.alreadyGraphed = false;
    //Get parameter and method user selections
    let tempP_X = this.graphSelectionsForm.get('ParametersX').value.pcode;
    let tempP_Y = this.graphSelectionsForm.get('ParametersY').value.pcode;
    let tempM_X = this.graphSelectionsForm.get('MethodsX').value;
    let tempM_Y = this.graphSelectionsForm.get('MethodsY').value;
    //If any parameter or method is left blank, prompt user to make a selection
    if (
      tempP_X === null ||
      tempP_Y === null ||
      tempM_X == null ||
      tempM_Y == null
    ) {
      this.snackBar.open(
        'Please select a parameter and method for each axis.',
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
      this.resizeDivs();

      //minimize graph options panel if the screen width is small
      let windowWidth = window.innerWidth;
      if (windowWidth < 800) {
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
      this.autotickEnabled = false;
    } else {
      this.xAxisType = 'scatter';
      this.autotickEnabled = true;
    }
  }

  //Called when user checks or unchecks y-axis log box
  public applyLogY(logYChecked: MatCheckboxChange) {
    if (logYChecked.checked) {
      this.yAxisType = 'log';
      this.autotickEnabled = false;
    } else {
      this.yAxisType = 'scatter';
      this.autotickEnabled = true;
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
    this.createCSV(this.allFlagTypes, 'flagTypes.csv');
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
    this.graphSelectionsService.allGraphDataYSubject.subscribe((ydata) => {
      yData = ydata;
    });
    this.graphSelectionsService.allGraphDataXSubject.subscribe((xdata) => {
      xData = xdata;
    });
    let allGraphData = xData.concat(yData);
    this.createCSV(allGraphData, 'plottedData.csv');
  }

  createCSV(data, filename) {
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
  public resizeDivs() {
    //get window dimensions
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;

    this.graphHeight = 0.7 * window.innerHeight;

    let graphOptionsBackgroundID = document.getElementById(
      'graphOptionsBackgroundID'
    );
    let graphBackgroundID = document.getElementById('graphBackgroundID');
    let graphOptionsCollapsedID = document.getElementById(
      'graphOptionsCollapsedID'
    );

    if (windowWidth < 800) {
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
    if (windowWidth > 800) {
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
    if (windowHeight < 723) {
      graphOptionsBackgroundID.classList.remove('marginTopFullHeight');
      graphOptionsBackgroundID.classList.add('marginTopSmallHeight');

      graphBackgroundID.classList.remove('marginTopFullHeight');
      graphBackgroundID.classList.add('marginTopSmallHeight');

      graphOptionsCollapsedID.classList.remove('marginTopFullHeight');
      graphOptionsCollapsedID.classList.add('marginTopSmallHeight');
    }
    if (windowHeight > 723) {
      graphOptionsBackgroundID.classList.add('marginTopFullHeight');
      graphOptionsBackgroundID.classList.remove('marginTopSmallHeight');

      graphBackgroundID.classList.add('marginTopFullHeight');
      graphBackgroundID.classList.remove('marginTopSmallHeight');

      graphOptionsCollapsedID.classList.add('marginTopFullHeight');
      graphOptionsCollapsedID.classList.remove('marginTopSmallHeight');
    }
    if (windowHeight < 700) {
      //add scrollbar
      graphOptionsBackgroundID.classList.add('optionsBackgroundResponsive');
      graphOptionsBackgroundID.classList.remove('optionsBackgroundHeightSmall');
    }
    if (windowHeight > 700) {
      //remove scrollbar
      graphOptionsBackgroundID.classList.remove('optionsBackgroundResponsive');
      graphOptionsBackgroundID.classList.add('optionsBackgroundHeightSmall');
    }
    if (windowWidth > 1200 && windowHeight > 450) {
      this.graphMargins = 80;
    }
    if (windowWidth < 1200 || windowHeight < 450) {
      //commenting this out for now because shrinking the margins make the axes titles overlap with the tick marks
      //this.graphMargins = 20;
    }

    if (this.showGraph) {
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
      this.minYear = 1975;
      this.maxYear = 2021;
    }
  }
  uncheckDatefromMapOptions() {
    this.datefromMap.checked = false;
  }
}
