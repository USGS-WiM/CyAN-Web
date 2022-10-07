import { Component, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  constructor() {}
  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  public showMap: Boolean = false;
  public showInfo: Boolean = false;
  public showGraph: Boolean = false;
  public windowWidthResize = false;
  public showIntro = true;
  public fullHomeScreen = true;
  public showFullCyanHomeBtn: Boolean = true;

  ngAfterViewInit(): void {
    window.onload = () => (this.windowWidthResize = window.innerWidth >= 900);
    window.onresize = () => (this.windowWidthResize = window.innerWidth >= 900);
    Promise.resolve().then(() => this.resizeDivs());
  }

  public changeLayout(homeLayout: Boolean) {
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
    this.showIntro = true;
    this.resizeDivs();
  }

  public clickMap() {
    this.showMap = true;
    this.showInfo = false;
    this.showGraph = false;
    this.showIntro = false;
    this.resizeDivs();
  }

  public clickInfo() {
    this.showInfo = true;
    this.showMap = false;
    this.showGraph = false;
    this.showIntro = false;
    this.resizeDivs();
  }

  public clickGraph() {
    this.showGraph = true;
    this.showInfo = false;
    this.showMap = false;
    this.showIntro = false;
    this.resizeDivs();
  }

  public resizeDivs() {
    //get window dimensions
    let windowWidth = window.innerWidth;

    if (windowWidth < 900) {
      this.showFullCyanHomeBtn = false;
    }
    if (windowWidth > 900) {
      this.showFullCyanHomeBtn = true;
    }
    if (windowWidth < 1000) {
      this.fullHomeScreen = false;
    }
    if (windowWidth > 1000) {
      this.fullHomeScreen = true;
    }
  }
}
