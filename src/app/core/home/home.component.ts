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
  ngOnInit(): void {
    // this.changeLayout(false);
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
    }
  }

  public clickMap() {
    console.log('clickMap');
    this.showMap = true;
    this.showHomeLayout = false;
  }

  public clickInfo() {
    this.showInfo = true;
    this.showHomeLayout = false;
  }
}
