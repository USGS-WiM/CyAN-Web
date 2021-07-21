import { Component, OnInit } from '@angular/core';
import { Options, LabelType } from '@angular-slider/ngx-slider';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-map-options',
  templateUrl: './map-options.component.html',
  styleUrls: ['./map-options.component.scss'],
})
export class MapOptionsComponent implements OnInit {
  minValue: number = 1975;
  maxValue: number = 2021;
  options: Options = {
    floor: 1975,
    ceil: 2021,
    barDimension: 150,
  };
  toppings = new FormControl();
  toppingList: string[] = [
    'Extra cheese',
    'Mushroom',
    'Onion',
    'Pepperoni',
    'Sausage',
    'Tomato',
  ];

  constructor() {}

  ngOnInit(): void {}
}
