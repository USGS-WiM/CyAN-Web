import { Component, OnInit } from '@angular/core';
import { ComponentDisplayService } from '../../shared/services/component-display.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private componentDisplayService: ComponentDisplayService) {}
  public showHomeLayout: Boolean = true;
  public showMap: Boolean = false;
  public showInfo: Boolean = false;
  public showGraph: Boolean = false;
  public windowWidth = false;
  ngOnInit(): void {
    window.onload = () => (this.windowWidth = window.innerWidth >= 700);
    window.onresize = () => (this.windowWidth = window.innerWidth >= 700);
  }
  public changeLayout(homeLayout: Boolean) {
    /*
    this.componentDisplayService.getHomeLayout(homeLayout);
    this.componentDisplayService.homeLayoutSubject.subscribe((res) => {
      this.showHomeLayout = res;
    }); */
    this.showHomeLayout = homeLayout;
    if (homeLayout === true) {
      this.showMap = false;
      this.showInfo = false;
      this.showGraph = false;
    }
  }

  public clickMap() {
    this.showMap = true;
    this.showHomeLayout = false;
    this.showInfo = false;
    this.showGraph = false;
  }

  public clickInfo() {
    this.showInfo = true;
    this.showHomeLayout = false;
    this.showMap = false;
    this.showGraph = false;
  }

  public clickGraph() {
    this.showGraph = true;
    this.showInfo = false;
    this.showHomeLayout = false;
    this.showMap = false;
  }
}
