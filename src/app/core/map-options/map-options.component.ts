import { Component, OnInit } from '@angular/core';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-map-options',
  templateUrl: './map-options.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class MapOptionsComponent implements OnInit {
  public basemapForm: FormGroup;
  public mapFilters: Boolean = true;
  public mapLayerOptions: Boolean = true;
  minValue: number = 1975;
  maxValue: number = 2021;
  timeOptions: Options = {
    floor: 1975,
    ceil: 2021,
    barDimension: 240,
  };

  Parameters = new FormControl();
  parameterList: string[] = [
    'Phosphorus',
    'Dissolved Oxygen',
    'pH',
    'Nitrogen',
    'Chloride',
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
  ];

  constructor(private formBuilder: FormBuilder) {
    this.basemapForm = formBuilder.group({
      baseControl: null,
    });
  }

  ngOnInit(): void {}

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
}
