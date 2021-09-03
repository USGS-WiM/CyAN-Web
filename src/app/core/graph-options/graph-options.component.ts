import { Component, OnInit, HostListener } from '@angular/core';
import * as Plotly from 'plotly.js-dist';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { FiltersService } from '../../shared/services/filters.service';
import { GraphSelectionsService } from 'src/app/shared/services/graph-selections.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-graph-options',
  templateUrl: './graph-options.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class GraphOptionsComponent implements OnInit {
  public secondTrace: Boolean = false;

  parameterList: string[] = [
    'Phosphorus',
    'Dissolved Oxygen',
    'pH',
    'Nitrogen',
    'Chloride',
  ];

  //Parameters for creating the year slider
  minValue: number = 1975;
  maxValue: number = 2021;
  timeOptions: Options = {
    floor: 1975,
    ceil: 2021,
    barDimension: 210,
    animate: false,
  };

  public graphHeight: Number;
  public graphWidth: Number;
  public graphMargins: Number;
  public graphOptionsVisible: Boolean = true;
  public showGraph = false;
  public xDataTrace1;
  public yDataTrace1;
  public xDataTrace2;
  public yDataTrace2;
  public parameterTypes$: Observable<any[]>;
  public methodTypes$: Observable<any[]>;
  public pcodeToMcode$: Observable<any[]>;
  // public sid$: Observable<any[]>;
  public matchingMcodesY = [];
  public matchingMcodesX = [];
  public pcodeToMcode;
  public mcodeShortName;
  public currentXaxisValues = [];
  public currentYaxisValues = [];
  // public sid = [];
  public pointColors = [];
  public flaggedPointIndices: Array<number> = [];
  graphSelectionsForm: FormGroup;
  public bivariatePlot: any;
  public optimalAlignment: Boolean = false;
  public filterQueryX;
  public filterQueryY;

  constructor(
    private filterService: FiltersService,
    private graphSelectionsService: GraphSelectionsService
  ) {
    this.parameterTypes$ = this.filterService.parameterTypes$;
    this.methodTypes$ = this.filterService.methodTypes$;
    this.pcodeToMcode$ = this.filterService.pcodeToMcode$;

    //this.allGraphDataX$ = this.filterService.allGraphDataX$;

    this.pcodeToMcode$ = this.filterService.pcodeToMcode$;
    // this.sid$ = this.filterService.sid$;
  }
  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    this.graphSelectionsForm = new FormGroup({
      ParametersX: new FormControl(),
      MethodsX: new FormControl(),
      ParametersY: new FormControl(),
      MethodsY: new FormControl(),
    });
    this.resizeDivs();
    this.pcodeToMcode$.subscribe((codes) => (this.pcodeToMcode = codes));
    this.methodTypes$.subscribe((codes) => (this.mcodeShortName = codes));

    /* this.graphSelectionsService.sidSubject.subscribe((sid) => {
      this.sid = sid;
    }); */

    this.graphSelectionsService.graphPointsXSubject.subscribe((points) => {
      this.currentXaxisValues = points;
    });
    this.graphSelectionsService.graphPointsYSubject.subscribe((points) => {
      this.currentYaxisValues = points;
      //  setTimeout(() => {
      // }, 2000);
      if (this.currentYaxisValues) {
        if (this.currentYaxisValues.length > 0) {
          for (let i = 0; i < this.currentYaxisValues.length; i++) {
            this.pointColors.push('rgb(242, 189, 161)');
          }
          this.showGraph = true;
        }
      }

      this.createGraph();
    });
  }

  public parameterX() {
    this.matchingMcodesX = [];
    let tempParameter = this.graphSelectionsForm.get('ParametersX').value;
    for (let pcode in this.pcodeToMcode) {
      if (pcode == tempParameter) {
        let mcodes = this.pcodeToMcode[pcode];
        for (let i = 0; i < this.mcodeShortName.length; i++) {
          for (let x = 0; x < mcodes.length; x++) {
            if (mcodes[x] == this.mcodeShortName[i].mcode) {
              this.matchingMcodesX.push(this.mcodeShortName[i]);
            }
          }
        }
      }
    }
  }

  public parameterY() {
    this.matchingMcodesY = [];
    let tempParameter = this.graphSelectionsForm.get('ParametersY').value;
    for (let pcode in this.pcodeToMcode) {
      if (pcode == tempParameter) {
        let mcodes = this.pcodeToMcode[pcode];
        for (let i = 0; i < this.mcodeShortName.length; i++) {
          for (let x = 0; x < mcodes.length; x++) {
            if (mcodes[x] == this.mcodeShortName[i].mcode) {
              this.matchingMcodesY.push(this.mcodeShortName[i]);
            }
          }
        }
      }
    }
  }

  public collapseGraphOptions(collapsed: Boolean) {
    this.graphOptionsVisible = collapsed;
    this.resizeDivs();
  }

  public createGraph() {
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
        // rangemode: 'tozero',
      },
      yaxis: {
        // rangemode: 'tozero',
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

    Plotly.newPlot(this.bivariatePlot, data, layout, {
      displaylogo: false,
    });

    let tempIndex = [];
    this.bivariatePlot.on('plotly_click', (data) => {
      var pn = '',
        tn = '',
        colors = [];
      for (var i = 0; i < data.points.length; i++) {
        pn = data.points[i].pointNumber;
        tn = data.points[i].curveNumber;
        colors = data.points[i].data.marker.color;
        tempIndex.push(data.points[i].pointIndex);
        if (this.flaggedPointIndices == undefined) {
          this.flaggedPointIndices = [];
        }
        this.flaggedPointIndices.push(data.points[i].pointIndex);
      }
      colors[pn] = 'rgb(104, 121, 128)';
      var update = { marker: { color: colors, size: 16 } };
      Plotly.restyle('graph', update, [tn]);
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
    this.showGraph = false;
    this.populateGraphData();
    this.resizeDivs();
  }

  public populateGraphData() {
    this.createQuery('xAxis');
    this.createQuery('yAxis');
    //this.graphSelectionsService.filterGraphPoints(this.filterQueryX, this.filterQueryY);
  }

  public createQuery(axis) {
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
    for (let i = 0; i < tempP.length; i++) {
      let matchMcodes = [];
      for (let pcode in this.pcodeToMcode) {
        if (pcode == tempP[i]) {
          let currentMcodes = [];
          currentMcodes.push(this.pcodeToMcode[pcode]);
          for (let y = 0; y < currentMcodes.length; y++) {
            for (let x = 0; x < tempM.length; x++) {
              if (currentMcodes[y] == tempM[x]) {
                matchMcodes.push(currentMcodes[y]);
              }
            }
          }
        }
      }
      items[tempP[i]] = matchMcodes[0];
    }
    if (axis == 'XAxis') {
      this.filterQueryX = {
        meta: {
          north: 90,
          south: -90,
          east: 180,
          west: -180,
          min_year: this.minValue,
          max_year: this.maxValue,
          include_NULL: false,
          satellite_align: this.optimalAlignment,
        },
        items,
      };
    }
    if (axis == 'YAxis') {
      this.filterQueryY = {
        meta: {
          north: 90,
          south: -90,
          east: 180,
          west: -180,
          min_year: this.minValue,
          max_year: this.maxValue,
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
