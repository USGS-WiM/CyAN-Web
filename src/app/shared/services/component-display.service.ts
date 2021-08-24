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
}
