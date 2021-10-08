import { Component, OnInit, HostListener } from '@angular/core';
import * as Plotly from 'plotly.js-dist';
import { FormControl, FormGroup } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { FiltersService } from '../../shared/services/filters.service';
import { GraphSelectionsService } from 'src/app/shared/services/graph-selections.service';
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

  //Graph options
  graphSelectionsForm = new FormGroup({
    ParametersX: new FormControl(),
    MethodsX: new FormControl(),
    ParametersY: new FormControl(),
    MethodsY: new FormControl(),
  });
  public optimalAlignment: Boolean = false;
  minYear: number = 1975;
  maxYear: number = 2021;
  timeOptions: Options = {
    floor: 1975,
    ceil: 2021,
    barDimension: 210,
    animate: false,
  };

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
  public flaggedPointIndices: Array<number> = [];

  //Graph layout
  public graphHeight: Number;
  public graphWidth: Number;
  public graphMargins: Number;
  public pointColors = [];
  public xAxisType = 'scatter';
  public yAxisType = 'scatter';
  public yAxisTitle = '';
  public xAxisTitle = '';
  public autotickEnabled: Boolean = true;

  constructor(
    private filterService: FiltersService,
    private graphSelectionsService: GraphSelectionsService,
    public snackBar: MatSnackBar
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
    this.graphSelectionsService.graphPointsXSubject.subscribe((points) => {
      this.currentXaxisValues = points;
      this.graphSelectionsService.graphPointsYSubject.subscribe((points) => {
        this.currentYaxisValues = points;
        if (this.currentYaxisValues) {
          if (this.currentYaxisValues.length > 0) {
            //Since the point colors changed when flagged, we begin by setting the color of each point individually
            for (let i = 0; i < this.currentYaxisValues.length; i++) {
              this.pointColors.push('rgb(242, 189, 161)');
            }
            //Create and display graph
            this.createGraph();
            this.showGraph = true;
            //Remove the WIM loader to view graph
            let base = document.getElementById('base');
            base.classList.remove('initial-loader');
          }
        }
      });
    });
  }

  //When a parameter is selected, this function is called to populate the Methods dropdown
  public populateMcodeDropdown(axis) {
    let formName = '';
    if (axis === 'xaxis') {
      console.log('made it to xaxis');
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
      name: 'Sample 1',
      // text: this.sid,
      textposition: 'bottom center',
      marker: { size: 12, color: this.pointColors },
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
      showlegend: true,
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

    this.flagPoint();
  }

  //Change color of flagged point and add x & y data to arrays
  public flagPoint() {
    let tempIndex = [];
    this.bivariatePlot.on('plotly_click', (selectedPoints) => {
      console.log('selectedPoints', selectedPoints);
      var pointNum = '',
        curveNum = '',
        colors = [];
      for (var i = 0; i < selectedPoints.points.length; i++) {
        pointNum = selectedPoints.points[i].pointNumber;
        curveNum = selectedPoints.points[i].curveNumber;
        colors = selectedPoints.points[i].data.marker.color;
        tempIndex.push(selectedPoints.points[i].pointIndex);
        if (this.flaggedPointIndices == undefined) {
          this.flaggedPointIndices = [];
        }
        this.flaggedPointIndices.push(selectedPoints.points[i].pointIndex);
      }
      console.log('colors[pointNum]', colors[pointNum]);

      if (colors[pointNum] === 'rgb(104, 121, 128)') {
        colors[pointNum] = 'rgb(242, 189, 161)';
        console.log('change once');
      } else {
        colors[pointNum] = 'rgb(104, 121, 128)';
        console.log('change twice');
      }
      var update = { marker: { color: colors, size: 16 } };
      Plotly.restyle('graph', update, [curveNum]);
    });
  }

  public createFlags() {
    let flaggedIndices;
    this.graphSelectionsService.flagsSubject.subscribe((flags) => {
      flaggedIndices = flags;
    });
    let tempXData;
    let tempYData;
    let flaggedXData = [];
    let flaggedYData = [];
    this.graphSelectionsService.allGraphDataYSubject.subscribe((data) => {
      tempYData = data;
      for (let i = 0; i < this.flaggedPointIndices.length; i++) {
        flaggedYData.push(tempYData[this.flaggedPointIndices[i]]);
      }
    });
    this.graphSelectionsService.allGraphDataXSubject.subscribe((data) => {
      tempXData = data;
      for (let i = 0; i < this.flaggedPointIndices.length; i++) {
        flaggedXData.push(tempXData[this.flaggedPointIndices[i]]);
      }
    });

    console.log('flaggedXData', flaggedXData);
    console.log('flaggedYData', flaggedYData);
  }

  public clickPlotData() {
    let tempP_X = this.graphSelectionsForm.get('ParametersX').value;
    let tempP_Y = this.graphSelectionsForm.get('ParametersY').value;
    let tempM_X = this.graphSelectionsForm.get('MethodsX').value;
    let tempM_Y = this.graphSelectionsForm.get('MethodsY').value;
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
      let base = document.getElementById('base');
      base.classList.add('initial-loader');
      this.showGraph = false;
      this.populateGraphData();
      this.resizeDivs();
    }
  }

  public selectOptionsWarning() {}

  public populateGraphData() {
    this.createQuery('xAxis');
    this.createQuery('yAxis');
    this.graphSelectionsService.getTempArrays(this.filterQueryX, 'xAxis');
    this.graphSelectionsService.getTempArrays(this.filterQueryY, 'yAxis');
    let xData;
    let yData;
    this.graphSelectionsService.resultsReadySubject.subscribe((ready) => {
      if (ready === true) {
        this.graphSelectionsService.tempResultsXSubject.subscribe(
          (resultsX) => {
            xData = resultsX;
            this.graphSelectionsService.tempResultsYSubject.subscribe(
              (resultsY) => {
                yData = resultsY;
                this.graphSelectionsService.filterGraphPoints(xData, yData);
              }
            );
          }
        );
      }
    });
  }

  public applyLogX(logXChecked: MatCheckboxChange) {
    if (logXChecked.checked) {
      this.xAxisType = 'log';
      this.autotickEnabled = false;
    } else {
      this.xAxisType = 'scatter';
      this.autotickEnabled = true;
    }
  }

  public applyLogY(logYChecked: MatCheckboxChange) {
    if (logYChecked.checked) {
      this.yAxisType = 'log';
      this.autotickEnabled = false;
    } else {
      this.yAxisType = 'scatter';
      this.autotickEnabled = true;
    }
  }

  public clickSatAlign(satAlignChecked: MatCheckboxChange) {
    if (satAlignChecked.checked) {
      this.optimalAlignment = true;
    } else {
      this.optimalAlignment = false;
    }
  }

  public createQuery(axis: string) {
    let tempP;
    let tempM;

    let matchMcodes = [];
    if (axis == 'xAxis') {
      tempP = this.graphSelectionsForm.get('ParametersX').value;
      tempM = this.graphSelectionsForm.get('MethodsX').value;
      if (!tempM) {
        for (let i = 0; i < this.matchingMcodesX.length; i++) {
          matchMcodes.push(this.matchingMcodesX[i].mcode);
        }
      }
    }
    if (axis == 'yAxis') {
      tempP = this.graphSelectionsForm.get('ParametersY').value;
      tempM = this.graphSelectionsForm.get('MethodsY').value;
      if (!tempM) {
        for (let i = 0; i < this.matchingMcodesY.length; i++) {
          matchMcodes.push(this.matchingMcodesX[i].mcode);
        }
      }
    }

    let items = new Object();
    for (let pcode in this.pcodeToMcode) {
      if (pcode == tempP) {
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
    items[tempP] = matchMcodes[0];
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
    if (axis === 'xAxis') {
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
        },
        items,
      };
    }
    if (axis === 'yAxis') {
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
        },
        items,
      };
    }
  }

  public resizeDivs() {
    //get window dimensions
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;

    this.graphHeight = 0.7 * window.innerHeight;
    // this.graphWidth = 0.5 * window.innerWidth;

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
    if (windowWidth > 1200 && windowHeight > 450) {
      this.graphMargins = 80;
    }
    if (windowWidth < 1200 || windowHeight < 450) {
      this.graphMargins = 20;
    }

    if (this.showGraph) {
      this.createGraph();
    }
  }
}
