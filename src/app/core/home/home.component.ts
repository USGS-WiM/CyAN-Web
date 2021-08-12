import { Component, AfterViewInit, HostListener } from '@angular/core';
import { ComponentDisplayService } from '../../shared/services/component-display.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  constructor(private componentDisplayService: ComponentDisplayService) {}
  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  public showHomeLayout: Boolean = true;
  public showMap: Boolean = false;
  public showInfo: Boolean = false;
  public showGraph: Boolean = false;
  public windowWidthResize = false;
  public fullHomeScreen = true;
  public showFullCyanHomeBtn: Boolean = true;
  ngAfterViewInit(): void {
    window.onload = () => (this.windowWidthResize = window.innerWidth >= 800);
    window.onresize = () => (this.windowWidthResize = window.innerWidth >= 800);
    Promise.resolve().then(() => this.resizeDivs());
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

  public clickHome() {
    this.showMap = false;
    this.showInfo = false;
    this.showGraph = false;
    this.showHomeLayout = true;
    this.resizeDivs();
  }

  public clickMap() {
    this.showMap = true;
    this.showHomeLayout = false;
    this.showInfo = false;
    this.showGraph = false;
    this.resizeDivs();
  }

  public clickInfo() {
    this.showInfo = true;
    this.showHomeLayout = false;
    this.showMap = false;
    this.showGraph = false;
    this.resizeDivs();
  }

  public clickGraph() {
    this.showGraph = true;
    this.showInfo = false;
    this.showHomeLayout = false;
    this.showMap = false;
    this.resizeDivs();
  }

  public resizeDivs() {
    //get window dimensions
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;

    let homeBtnFullID = document.getElementById('homeBtnFullID');
    let infoBtnFullID = document.getElementById('infoBtnFullID');
    let mapBtnFullID = document.getElementById('mapBtnFullID');
    if (windowWidth < 800 && !this.showHomeLayout) {
      this.showFullCyanHomeBtn = false;
    }
    if (windowWidth > 800 || this.showHomeLayout) {
      this.showFullCyanHomeBtn = true;
    }
    if (windowWidth < 720) {
      if (windowWidth > 605) {
        homeBtnFullID.classList.remove('marginLeftFullWidth');
        homeBtnFullID.classList.add('marginLeftSmallWidth');

        infoBtnFullID.classList.remove('marginLeftFullWidth');
        infoBtnFullID.classList.add('marginLeftSmallWidth');

        mapBtnFullID.classList.remove('mapBtnFullMargin');
        mapBtnFullID.classList.add('mapBtnSmallMargin');
      }
      if (windowWidth < 605) {
        this.fullHomeScreen = false;
      }
    }
    if (windowWidth > 605) {
      this.fullHomeScreen = true;
    }
    if (windowWidth > 720) {
      homeBtnFullID.classList.add('marginLeftFullWidth');
      homeBtnFullID.classList.remove('marginLeftSmallWidth');

      infoBtnFullID.classList.add('marginLeftFullWidth');
      infoBtnFullID.classList.remove('marginLeftSmallWidth');

      mapBtnFullID.classList.add('mapBtnFullMargin');
      mapBtnFullID.classList.remove('mapBtnSmallMargin');
    }
  }
}
