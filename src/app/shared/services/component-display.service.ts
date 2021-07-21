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
    console.log('display', display);
    this.homeLayoutSubject.next(display);
  }
}
