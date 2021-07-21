import { R3TargetBinder } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import * as Plotly from 'plotly.js-dist';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-graph-options',
  templateUrl: './graph-options.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class GraphOptionsComponent implements OnInit {
  Parameters = new FormControl();
  parameterList: string[] = [
    'Phosphorus',
    'Dissolved Oxygen',
    'pH',
    'Nitrogen',
    'Chloride',
  ];
  constructor() {}

  ngOnInit(): void {
    let bivariatePlot = document.getElementById('graph');
    var trace1 = {
      x: [1, 2, 3, 4, 5],
      y: [1, 6, 3, 6, 1],
      mode: 'markers',
      type: 'scatter',
      name: 'Sample 1',
      text: ['A-1', 'A-2', 'A-3', 'A-4', 'A-5'],
      marker: { size: 12, color: 'rgb(242, 189, 161) ' },
    };

    var trace2 = {
      x: [1.5, 2.5, 3.5, 4.5, 5.5],
      y: [4, 1, 7, 1, 4],
      mode: 'markers',
      type: 'scatter',
      name: 'Sample 2',
      text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
      marker: { size: 12, color: 'rgb(104, 121, 128)' },
    };

    var data = [trace1, trace2];

    var layout = {
      xaxis: {
        range: [0.75, 5.25],
      },
      yaxis: {
        range: [0, 8],
      },
      paper_bgcolor: 'rgb(255, 255, 255, 0)',
      plot_bgcolor: 'rgb(255, 255, 255, 0)',
    };

    Plotly.newPlot(bivariatePlot, data, layout);
  }
}
