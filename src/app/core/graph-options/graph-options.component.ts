import { Component, OnInit, HostListener } from '@angular/core';
import * as Plotly from 'plotly.js-dist';
import { FormControl, FormGroup } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { FiltersService } from '../../shared/services/filters.service';
import { GraphSelectionsService } from 'src/app/shared/services/graph-selections.service';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';
import { Observable } from 'rxjs/Observable';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  public methodsToDisplay: string[];
  public methodComboSelections: string[];
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

  //flags
  showFlagOptions: Boolean = false;
  xAxisChecked: Boolean = false;
  yAxisChecked: Boolean = false;
  clickedPoint;
  public axisFlagForm = new FormGroup({
    xFlagControl: new FormControl(),
    yFlagControl: new FormControl(),
  });

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

  //Graph data
  public xDataTrace1;
  public yDataTrace1;
  public xDataTrace2;
  public yDataTrace2;
  public currentXaxisValues = [];
  public currentYaxisValues = [];
  public flaggedPointIndices = { x: [], y: [] };
  public xFlaggedPointIndices: Array<number> = [];
  public yFlaggedPointIndices: Array<number> = [];
  public allGraphData;

  //Graph layout
  public graphHeight: Number;
  public graphWidth: Number;
  public graphMargins: Number;
  public pointColors = [];
  public pointSymbols = [];
  public xAxisType = 'scatter';
  public yAxisType = 'scatter';
  public yAxisTitle = '';
  public xAxisTitle = '';
  public autotickEnabled: Boolean = true;

  constructor(
    private filterService: FiltersService,
    private graphSelectionsService: GraphSelectionsService,
    public snackBar: MatSnackBar,
    private componentDisplayService: ComponentDisplayService
  ) {
    this.parameterTypes$ = this.filterService.parameterTypes$;
    this.methodTypes$ = this.filterService.methodTypes$;
    this.pcodeToMcode$ = this.filterService.pcodeToMcode$;
  }

  //Reset the css (via resizeDivs()) when the window is resized
  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    //Set the display according to the initial screen dimensions
    this.resizeDivs();
    this.initiateGraphService();
  }

  public initiateGraphService() {
    //Get the data to populate the dropdowns in Graph Options
    this.pcodeToMcode$.subscribe((codes) => (this.pcodeToMcode = codes));
    this.methodTypes$.subscribe((codes) => (this.mcodeShortName = codes));
    this.parameterTypes$.subscribe(
      (parameters) => (this.parameterTypes = parameters)
    );

    /* this.graphSelectionsService.sidSubject.subscribe((sid) => {
      this.sid = sid;
    }); */

    //Reset the x and y values displayed on the graph whenever the values change in the service
    this.graphSelectionsService.makeGraphSubject.subscribe((makeGraph) => {
      let graphOptionsBackgroundID = document.getElementById(
        'graphOptionsBackgroundID'
      );
      let graphDataDownloadBtn = document.getElementById(
        'graphDataDownloadBtn'
      );
      if (makeGraph === true && this.alreadyGraphed === false) {
        this.graphSelectionsService.graphPointsXSubject.subscribe((points) => {
          this.currentXaxisValues = points;
          this.graphSelectionsService.graphPointsYSubject.subscribe(
            (points) => {
              this.currentYaxisValues = points;
              if (this.currentYaxisValues && this.currentXaxisValues) {
                if (
                  this.currentYaxisValues.length > 0 &&
                  this.currentXaxisValues.length > 0
                ) {
                  this.alreadyGraphed = true;
                  //Since the point colors changed when flagged, we begin by setting the color of each point individually
                  for (let i = 0; i < this.currentYaxisValues.length; i++) {
                    this.pointColors.push('rgb(242, 189, 161)');
                    this.pointSymbols.push('circle-open');
                  }
                  //Create and display graph
                  this.createGraph();
                  this.showGraph = true;
                  //Remove the WIM loader to view graph
                  let base = document.getElementById('base');
                  base.classList.remove('initial-loader');
                  graphOptionsBackgroundID.classList.remove('disableClick');
                  graphDataDownloadBtn.classList.remove('disabledDataBtn');
                }
              }
              if (!this.currentYaxisValues || !this.currentXaxisValues) {
                if (this.alreadyGraphed === false) {
                  this.alreadyGraphed = true;
                  let base = document.getElementById('base');
                  base.classList.remove('initial-loader');
                  this.showGraph = false;
                  graphOptionsBackgroundID.classList.remove('disableClick');
                  graphDataDownloadBtn.classList.remove('disabledDataBtn');
                }
              }
            }
          );
        });
      }
    });
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
      if (pcode == tempParameter) {
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

  public createGraph() {
    //Designate div to put graph
    this.bivariatePlot = document.getElementById('graph');

    var trace1 = {
      x: this.currentXaxisValues,
      y: this.currentYaxisValues,
      mode: 'markers',
      type: 'scatter',
      //name: 'Sample 1',
      // text: this.sid,
      textposition: 'bottom center',
      marker: { size: 12, color: this.pointColors, symbol: this.pointSymbols },
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

    //build the graph
    Plotly.newPlot(this.bivariatePlot, data, layout, {
      displaylogo: false,
    });

    this.clickPoint();
  }

  closeFlagOptions() {
    //Close flag options modal
    this.showFlagOptions = false;

    //Reset form
    this.axisFlagForm.get('xFlagControl').setValue(null);
    this.axisFlagForm.get('yFlagControl').setValue(null);

    //Disable/enable flag button
    let flagBtn = document.getElementById('flagBtn');
    if (this.flaggedPointIndices.x) {
      if (this.flaggedPointIndices.x.length > 0) {
        flagBtn.classList.remove('disabledDataBtn');
      }
    }
    if (this.flaggedPointIndices.y) {
      if (this.flaggedPointIndices.y.length > 0) {
        flagBtn.classList.remove('disabledDataBtn');
      }
    } else {
      flagBtn.classList.add('disabledDataBtn');
    }
  }

  updateGraph(color: String, axis: String, symbol: String) {
    let tempIndex = [];
    let flaggedData = [];
    let pointNum = '';
    let colors: [];
    let symbols: [];

    for (let i = 0; i < this.clickedPoint.points.length; i++) {
      pointNum = this.clickedPoint.points[i].pointNumber;
      colors = this.clickedPoint.points[i].data.marker.color;
      console.log(
        'this.clickedPoint.points[i].data.marker',
        this.clickedPoint.points[i].data.marker
      );
      symbols = this.clickedPoint.points[i].data.marker.symbol;
      console.log('symbols', symbols);
      tempIndex.push(this.clickedPoint.points[i].pointIndex);
      if (axis == 'x' || axis == 'both') {
        if (!this.flaggedPointIndices.x) {
          this.flaggedPointIndices.x = [];
        }
        this.flaggedPointIndices.x.push(this.clickedPoint.points[i].pointIndex);
      }
      if (axis == 'y' || axis == 'both') {
        if (!this.flaggedPointIndices.y) {
          this.flaggedPointIndices.y = [];
        }
        this.flaggedPointIndices.y.push(this.clickedPoint.points[i].pointIndex);
      }
    }

    //Change the color of the point at the correct index
    colors[pointNum] = color;
    symbols[pointNum] = symbol;

    //New styling for new plot
    var update = {
      marker: { color: colors, size: 12, symbol: symbols },
    };

    //Change the color on the graph
    Plotly.restyle('graph', update);

    let tempData;
    if (axis == 'x' || axis == 'both') {
      //Get all of the data corresponding with the flagged point
      this.graphSelectionsService.allGraphDataXSubject.subscribe((data) => {
        tempData = data;
        for (let i = 0; i < this.flaggedPointIndices.x.length; i++) {
          flaggedData.push(tempData[this.flaggedPointIndices.x[i]]);
        }
      });
    }
    if (axis == 'y' || axis == 'both') {
      //Get all of the data corresponding with the flagged point
      this.graphSelectionsService.allGraphDataYSubject.subscribe((data) => {
        tempData = data;
        for (let i = 0; i < this.flaggedPointIndices.y.length; i++) {
          flaggedData.push(tempData[this.flaggedPointIndices.y[i]]);
        }
      });
    }

    //No fancy download yet; displaying data in console for now
    console.log('flaggedData', flaggedData);
  }

  //Triggered when the 'Submit' button is clicked in the flag modal
  submitFlagSelections() {
    //Colors for all 4 flagging options
    let unflaggedColor = 'rgb(242, 189, 161)';
    let xyFlaggedColor = 'rgb(0, 153, 0)';
    let xFlaggedColor = 'rgb(255, 0, 255)';
    let yFlaggedColor = 'rgb(0, 204, 204)';

    //Symbols for flagged vs unflagged
    let unflaggedSymbol = 'circle-open';
    let flaggedSymbol = 'cirlce';

    //X and Y both checked
    if (
      this.axisFlagForm.get('xFlagControl').value &&
      this.axisFlagForm.get('yFlagControl').value
    ) {
      this.updateGraph(xyFlaggedColor, 'both', flaggedSymbol);
    }

    //Y checked; x not checked
    if (
      this.axisFlagForm.get('yFlagControl').value &&
      !this.axisFlagForm.get('xFlagControl').value
    ) {
      this.updateGraph(yFlaggedColor, 'y', flaggedSymbol);
    }

    //X checked; Y not checked
    if (
      !this.axisFlagForm.get('yFlagControl').value &&
      this.axisFlagForm.get('xFlagControl').value
    ) {
      this.updateGraph(xFlaggedColor, 'x', flaggedSymbol);
    }

    //Neither X nor y checked
    if (
      !this.axisFlagForm.get('yFlagControl').value &&
      !this.axisFlagForm.get('xFlagControl').value
    ) {
      this.updateGraph(unflaggedColor, 'none', unflaggedSymbol);
    }

    //Close flag modal and clear selections
    this.closeFlagOptions();
  }

  //Change color of flagged point and add x & y data to arrays
  public clickPoint() {
    this.bivariatePlot.on('plotly_click', (selectedPoints) => {
      this.clickedPoint = selectedPoints;
      //Open flag options modal
      this.showFlagOptions = true;
    });
  }

  //Called when user clicks the flag button
  //Retrieves indicies of flagged data, get the corresponding data, and adds those data to x and y arrays
  public createFlags() {
    let tempXData;
    let tempYData;
    let flaggedXData = [];
    let flaggedYData = [];
    this.graphSelectionsService.allGraphDataYSubject.subscribe((data) => {
      tempYData = data;
      for (let i = 0; i < this.xFlaggedPointIndices.length; i++) {
        flaggedYData.push(tempYData[this.xFlaggedPointIndices[i]]);
      }
    });
    this.graphSelectionsService.allGraphDataXSubject.subscribe((data) => {
      tempXData = data;
      for (let i = 0; i < this.xFlaggedPointIndices.length; i++) {
        flaggedXData.push(tempXData[this.xFlaggedPointIndices[i]]);
      }
    });
  }

  //Called when user clicks 'Plot Data'
  public clickPlotData() {
    this.alreadyGraphed = false;
    //Get parameter and method user selections
    let tempP_X = this.graphSelectionsForm.get('ParametersX').value;
    let tempP_Y = this.graphSelectionsForm.get('ParametersY').value;
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
        'Please select a parameter and at least one method for each axis.',
        'OK',
        {
          duration: 4000,
          verticalPosition: 'top',
        }
      );
    } else {
      //Add the WIM loader while graph is being created
      let base = document.getElementById('base');
      let graphDataDownloadBtn = document.getElementById(
        'graphDataDownloadBtn'
      );
      base.classList.add('initial-loader');
      let graphOptionsBackgroundID = document.getElementById(
        'graphOptionsBackgroundID'
      );
      graphOptionsBackgroundID.classList.add('disableClick');
      graphDataDownloadBtn.classList.add('disabledDataBtn');
      this.showGraph = false;
      this.populateGraphData();
      this.resizeDivs();

      //minimize graph options panel if the screen width is small
      let windowWidth = window.innerWidth;
      if (windowWidth < 800) {
        this.collapseGraphOptions(false);
      }
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

  //Populate the method combination dropdown according to the selected methods
  public methodSelectionChanged() {
    this.methodsToDisplay = [];
    this.methodComboSelections = [];
    let tempMethodsX = this.graphSelectionsForm.get('MethodsX').value;
    let tempMethodsY = this.graphSelectionsForm.get('MethodsY').value;
    if (tempMethodsY) {
      if (tempMethodsX) {
        for (let i = 0; i < tempMethodsX.length; i++) {
          for (let x = 0; x < tempMethodsY.length; x++) {
            let newMethodCombo = tempMethodsX[i] + ' & ' + tempMethodsY[x];
            this.methodsToDisplay.push(newMethodCombo);
          }
        }
      }
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
    let tempP;
    let tempM;

    if (axis == 'xAxis') {
      tempP = this.graphSelectionsForm.get('ParametersX').value;
      tempM = this.graphSelectionsForm.get('MethodsX').value;
    }
    if (axis == 'yAxis') {
      tempP = this.graphSelectionsForm.get('ParametersY').value;
      tempM = this.graphSelectionsForm.get('MethodsY').value;
    }

    let items = new Object();
    //Populate the 'items' object (parameters & methods) in the query object
    items[tempP] = tempM;
    //Populate axes titles
    for (let i = 0; i < this.parameterTypes.length; i++) {
      if (tempP === this.parameterTypes[i].pcode) {
        if (axis === 'yAxis') {
          this.yAxisTitle = this.parameterTypes[i].short_name;
        }
        if (axis === 'xAxis') {
          this.xAxisTitle = this.parameterTypes[i].short_name.toString(); // + " " + this.parameterTypes[i].unit;
        }
      }
    }
    //Create separate query objects for x and y data
    if (axis === 'xAxis') {
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
  }

  //creates a csv containing all of the user-defined filters
  public graphDataDownload() {
    let maxDateReturned;
    let minDateReturned;
    this.graphSelectionsService.maxDateSubject.subscribe(
      (maxDate) => (maxDateReturned = maxDate)
    );
    this.graphSelectionsService.minDateSubject.subscribe(
      (minDate) => (minDateReturned = minDate)
    );

    let graphMetadataContent = 'data:text/csv;charset=utf-8,';

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

    let graphMetadata = [
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
        this.graphSelectionsForm.get('ParametersX').value,
        formattedMcodeX,
        this.graphSelectionsForm.get('ParametersY').value,
        formattedMcodeY,
      ],
    ];

    //Create and download a csv of the graph metadata
    //The following code was adapted from this example:
    //https://www.delftstack.com/howto/javascript/export-javascript-csv/
    graphMetadata.forEach(function (rowArray) {
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
      this.createGraph();
    }
  }
}
