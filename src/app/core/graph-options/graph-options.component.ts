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
  flaggedData = [];
  rolloverFlagsX = [];
  rolloverFlagsY = [];
  showFlagOptions: Boolean = false;
  sameQuery: Boolean = false;
  xAxisChecked: Boolean = false;
  yAxisChecked: Boolean = false;
  clickedPoint;
  public axisFlagForm = new FormGroup({
    xFlagControl: new FormControl(),
    yFlagControl: new FormControl(),
    xyFlagControl: new FormControl(),
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
  //Prevent duplicates
  existingDupX: Boolean = false;
  existingDupY: Boolean = false;

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
    private componentDisplayService: ComponentDisplayService
  ) {
    this.parameterTypes$ = this.filterService.parameterTypes$;
    this.methodTypes$ = this.filterService.methodTypes$;
    this.pcodeToMcode$ = this.filterService.pcodeToMcode$;
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
    //rolloverFlags means the flags that were assigned for these specific datasets in a graph that was previously generated
    this.graphSelectionsService.flagIndexX.subscribe((xFlags) => {
      this.rolloverFlagsX = xFlags;
    });
    this.graphSelectionsService.flagIndexY.subscribe((yFlags) => {
      this.rolloverFlagsY = yFlags;
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
                  this.createGraph();
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
        this.graphSelectionsForm.get('ParametersX').value,
        formattedMcodeX,
        this.graphSelectionsForm.get('ParametersY').value,
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
    this.allColors = this.graphSelectionsService.pointColors;
    this.allShapes = this.graphSelectionsService.pointSymbol;
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

    //build the graph
    Plotly.newPlot(this.bivariatePlot, data, layout, {
      displaylogo: false,
    });

    this.clickPoint();
  }

  flagAllData() {
    let xData;
    let yData;
    this.graphSelectionsService.allGraphDataYSubject.subscribe((ydata) => {
      yData = ydata;
    });
    this.graphSelectionsService.allGraphDataXSubject.subscribe((xdata) => {
      xData = xdata;
    });
    this.flaggedData = this.flaggedData.concat(xData);
    this.flaggedData = this.flaggedData.concat(yData);
    let numPts = xData.length;
    const colorArr = Array(numPts).fill(this.xyFlaggedColor);
    const shapeArr = Array(numPts).fill(this.flaggedSymbol);
    //New styling for new plot
    var update = {
      marker: { color: colorArr, size: 12, symbol: shapeArr },
    };

    //Change the color on the graph
    Plotly.restyle('graph', update);
    console.log(this.flaggedData);

    this.graphSelectionsService.flagsSubject.next(this.flaggedData);
    this.disableEnable('flagBtn', true, true);
  }
  closeFlagOptions() {
    //Close flag options modal
    this.showFlagOptions = false;
    this.disableEnable('graph', true, false);
    this.disableEnable('graphDownload', true, true);
    this.disableEnable('flagAll', true, true);
    this.disableEnable('graphOptionsBackgroundID', true, false);
    this.disableEnable('createGraph', true, true);
    this.disableEnable('flagBtn', true, true);
    this.disableEnable('graphDataDownloadBtn', true, true);
    this.disableEnable('flagUpload', true, true);

    //Reset form
    this.axisFlagForm.get('xFlagControl').setValue(null);
    this.axisFlagForm.get('yFlagControl').setValue(null);
    this.axisFlagForm.get('xyFlagControl').setValue(null);

    //Disable/enable flag button
    if (this.flaggedPointIndices.x) {
      if (this.flaggedPointIndices.x.length > 0) {
        this.disableEnable('flagBtn', true, true);
      }
    }
    if (this.flaggedPointIndices.y) {
      if (this.flaggedPointIndices.y.length > 0) {
        this.disableEnable('flagBtn', true, true);
      }
    } else {
      this.disableEnable('flagBtn', false, true);
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

  //Called whenever a flag is selected/deselected
  updateGraph(color: String, axis: String, symbol: String) {
    let pointIndex = '';
    let colors: [];
    let symbols: [];
    let updateGraphCalled = true;

    //clickedPoints contains info about the click point: index of the point in the array created for this graph, the x and y values, and the marker display
    for (let i = 0; i < this.clickedPoint.points.length; i++) {
      //unique id/index for selected point for this specific graph
      pointIndex = this.clickedPoint.points[i].pointIndex;
      //data.marker.color = marker color array for all points in rgb
      colors = this.clickedPoint.points[i].data.marker.color;
      //data.marker.symbol = array of shapes for all points
      symbols = this.clickedPoint.points[i].data.marker.symbol;

      //x and y data are flagged separately; need to keep track of which axis was flagged
      if (axis == 'x' || axis == 'both') {
        if (!this.flaggedPointIndices.x) {
          //if there are no x-axis flags, create empty array
          this.flaggedPointIndices.x = [];
        }
        //add new x-axis index to the array (if it's not already there)
        if (!this.existingDupX) {
          this.flaggedPointIndices.x.push(
            this.clickedPoint.points[i].pointIndex
          );
        }
      }
      if (axis == 'y' || axis == 'both') {
        if (!this.flaggedPointIndices.y) {
          //if there are no y-axis flags, create empty array
          this.flaggedPointIndices.y = [];
        }
        //add new y-axis index to the array
        if (!this.existingDupY) {
          this.flaggedPointIndices.y.push(
            this.clickedPoint.points[i].pointIndex
          );
        }
      }
      if (axis == 'none') {
        if (this.flaggedPointIndices.y) {
          for (let i = 0; i < this.flaggedPointIndices.y.length; i++) {
            if (pointIndex == this.flaggedPointIndices.y.length[i]) {
              this.flaggedPointIndices.y = this.flaggedPointIndices.y.splice(
                i,
                1
              );
            }
          }
        }
        if (this.flaggedPointIndices.x) {
          if (pointIndex == this.flaggedPointIndices.x.length[i]) {
            this.flaggedPointIndices.x = this.flaggedPointIndices.x.splice(
              i,
              1
            );
          }
        }
      }
    }

    //Change the color of the point at the correct index (according to x-axis, y-axis, or both selection)
    colors[pointIndex] = color;
    //Change the symbol of the point at the correct index (flagged pts become filled circles; unflagged becomes hollow circle)
    symbols[pointIndex] = symbol;

    //New styling for new plot
    var update = {
      marker: { color: colors, size: 12, symbol: symbols },
    };

    //Change the color on the graph
    Plotly.restyle('graph', update);
    //if only the x-axis is selected, make sure the y-value at that point isn't in the flaggedData array
    //if neither are selected, ensure that neither are in the flaggedData array
    if (axis == 'x' || axis == 'none') {
      if (this.flaggedData) {
        this.graphSelectionsService.allGraphDataYSubject.subscribe((ydata) => {
          if (updateGraphCalled) {
            let pointToRemove = ydata[pointIndex];
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
          if (!this.existingDupX) {
            this.flaggedData.push(
              tempData[
                this.flaggedPointIndices.x[
                  this.flaggedPointIndices.x.length - 1
                ]
              ]
            );
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
          if (!this.existingDupY) {
            this.flaggedData.push(
              tempData[
                this.flaggedPointIndices.y[
                  this.flaggedPointIndices.y.length - 1
                ]
              ]
            );
            this.graphSelectionsService.flagsSubject.next(this.flaggedData);
          }
        }
      });
    }
    console.log('this.flaggedData', this.flaggedData);
    updateGraphCalled = false;
    this.existingDupX = false;
    this.existingDupY = false;
  }

  //Triggered when the 'Submit' button is clicked in the flag modal
  submitFlagSelections() {
    let xChecked = this.axisFlagForm.get('xFlagControl').value;
    let yChecked = this.axisFlagForm.get('yFlagControl').value;
    if (xChecked && yChecked) {
      this.updateGraph(this.xyFlaggedColor, 'both', this.flaggedSymbol);
    }
    //Y checked; x not checked
    if (yChecked && !xChecked) {
      this.updateGraph(this.yFlaggedColor, 'y', this.flaggedSymbol);
    }

    //X checked; Y not checked
    if (!yChecked && xChecked) {
      this.updateGraph(this.xFlaggedColor, 'x', this.flaggedSymbol);
    }

    //Neither X nor y checked
    if (!yChecked && !xChecked) {
      this.updateGraph(this.unflaggedColor, 'none', this.unflaggedSymbol);
    }

    //Close flag modal and clear selections
    this.closeFlagOptions();
  }
  submitFlagSelectionsSingle() {
    let xyChecked = this.axisFlagForm.get('xyFlagControl').value;
    if (xyChecked) {
      this.updateGraph(this.xyFlaggedColor, 'both', this.flaggedSymbol);
    } else {
      this.updateGraph(this.unflaggedColor, 'none', this.unflaggedSymbol);
    }
    //Close flag modal and clear selections
    this.closeFlagOptions();
  }

  //Change color of flagged point and add x & y data to arrays
  public clickPoint() {
    this.bivariatePlot.on('plotly_click', (selectedPoints) => {
      //If there is a flag at the selected point, pre-check the boxes in the flag options modal
      this.axisFlagFormCheckBoxes(selectedPoints);
      this.clickedPoint = selectedPoints;
      //Open flag options modal
      this.showFlagOptions = true;
      this.disableEnable('graph', false, false);
      this.disableEnable('graphDownload', false, true);
      this.disableEnable('flagAll', false, true);
      this.disableEnable('graphOptionsBackgroundID', false, false);
      this.disableEnable('createGraph', false, true);
      this.disableEnable('flagBtn', false, true);
      this.disableEnable('graphDataDownloadBtn', false, true);
      this.disableEnable('flagUpload', false, true);
    });
  }

  //If there is a flag at the selected point, pre-check the boxes in the flag options modal
  axisFlagFormCheckBoxes(selectedPoints) {
    let selectedColor = selectedPoints.points[0]['marker.color'];
    if (selectedColor == this.xyFlaggedColor) {
      //check both boxes
      this.axisFlagForm.get('xFlagControl').setValue(true);
      this.axisFlagForm.get('yFlagControl').setValue(true);
      this.axisFlagForm.get('xyFlagControl').setValue(true);
      //Used for preventing flag duplicates
      this.existingDupX = true;
      this.existingDupY = true;
    }
    if (selectedColor == this.xFlaggedColor) {
      //check the x box
      this.axisFlagForm.get('xFlagControl').setValue(true);
      //Used for preventing flag duplicates
      this.existingDupY = true;
    }
    if (selectedColor == this.yFlaggedColor) {
      //check the y box
      this.axisFlagForm.get('yFlagControl').setValue(true);
      //Used for preventing flag duplicates
      this.existingDupY = true;
    }
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
      tempP = this.graphSelectionsForm.get('ParametersX').value;
      tempM = this.graphSelectionsForm.get('MethodsX').value;
    }
    if (axis == 'yAxis') {
      tempP = this.graphSelectionsForm.get('ParametersY').value;
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
    let flagContent = 'data:text/csv;charset=utf-8,';
    let csv = data.map((row) => Object.values(row));
    csv.unshift(Object.keys(data[0]));
    flagContent += csv.join('\n');
    let encodedUri = encodeURI(flagContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
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
