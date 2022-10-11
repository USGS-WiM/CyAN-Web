import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComponentDisplayService {
  constructor() {}

  //About modal
  public aboutVisibleSubject = new BehaviorSubject<Boolean>(undefined);
  aboutVisible$ = this.aboutVisibleSubject.asObservable();

  public getAboutVisible(display: boolean) {
    this.aboutVisibleSubject.next(display);
  }

  //default home screen configuration
  public homeLayoutSubject = new BehaviorSubject<Boolean>(undefined);
  homeLayout$ = this.homeLayoutSubject.asObservable();

  public getHomeLayout(display: Boolean) {
    this.homeLayoutSubject.next(display);
  }

  //get USA bar
  public usaBarCollapseSubject = new BehaviorSubject<Boolean>(undefined);
  usaBarCollapse$ = this.usaBarCollapseSubject.asObservable();

  public getUsaBarCollapse(collapse: Boolean) {
    this.usaBarCollapseSubject.next(collapse);
  }

  //map button clicked
  public mapBtnSubject = new BehaviorSubject<Boolean>(undefined);
  mapBtn$ = this.mapBtnSubject.asObservable();

  public getMapBtn(collapse: Boolean) {
    this.mapBtnSubject.next(collapse);
  }

  //graph button clicked
  public graphBtnSubject = new BehaviorSubject<Boolean>(undefined);
  graphBtn$ = this.graphBtnSubject.asObservable();

  public getGraphBtn(collapse: Boolean) {
    this.graphBtnSubject.next(collapse);
  }

  //disable map
  public disableMapSubject = new BehaviorSubject<Boolean>(undefined);
  disableMap$ = this.disableMapSubject.asObservable();

  public getDisableMap(disable: Boolean) {
    this.disableMapSubject.next(disable);
  }

  //get bounding box: north
  public northBoundsSubject = new BehaviorSubject<number>(undefined);
  northBounds$ = this.northBoundsSubject.asObservable();

  public getNorthBounds(north: number) {
    this.northBoundsSubject.next(north);
  }

  //get bounding box: south
  public southBoundsSubject = new BehaviorSubject<number>(undefined);
  southBounds$ = this.southBoundsSubject.asObservable();

  public getSouthBounds(south: number) {
    this.southBoundsSubject.next(south);
  }

  //get bounding box: east
  public eastBoundsSubject = new BehaviorSubject<number>(undefined);
  eastBounds$ = this.eastBoundsSubject.asObservable();

  public getEastBounds(east: number) {
    this.eastBoundsSubject.next(east);
  }

  //get bounding box: west
  public westBoundsSubject = new BehaviorSubject<number>(undefined);
  westBounds$ = this.westBoundsSubject.asObservable();

  public getWestBounds(west: number) {
    this.westBoundsSubject.next(west);
  }

  //for storing what's in the map options: north
  public storeNorthSubject = new BehaviorSubject<number>(undefined);
  storeNorthBounds$ = this.storeNorthSubject.asObservable();

  public getStoreNorthBounds(north: number) {
    this.storeNorthSubject.next(north);
  }

  //for storing what's in the map options: south
  public storeSouthSubject = new BehaviorSubject<number>(undefined);
  storeSouthBounds$ = this.storeSouthSubject.asObservable();

  public getStoreSouthBounds(south: number) {
    this.storeSouthSubject.next(south);
  }

  //for storing what's in the map options: east
  public storeEastSubject = new BehaviorSubject<number>(undefined);
  storeEastBounds$ = this.storeEastSubject.asObservable();

  public getStoreEastBounds(north: number) {
    this.storeEastSubject.next(north);
  }

  //for storing what's in the map options: west
  public storeWestSubject = new BehaviorSubject<number>(undefined);
  storeWestBounds$ = this.storeWestSubject.asObservable();

  public getStoreWestBounds(south: number) {
    this.storeWestSubject.next(south);
  }

  //for storing what's in the map options: region
  public storeRegionSubject = new BehaviorSubject<any[]>(undefined);
  storeRegion$ = this.storeWestSubject.asObservable();

  public getStoreRegionSubject(region: any[]) {
    this.storeRegionSubject.next(region);
  }
}
