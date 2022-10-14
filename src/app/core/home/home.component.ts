import { Component, AfterViewInit, HostListener, Inject, Optional } from '@angular/core';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmFlagsComponent} from '../confirm/confirm-flags.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  constructor(
    private componentDisplayService: ComponentDisplayService,
    public dialog: MatDialog,
    ) {}
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
  public selectedColor = 'rgb(255, 255, 255)';
  public homeColor = '#f2e6b1';
  public infoColor = '#95dab6';
  public mapColor = '#83b2d0';
  public graphColor = '#7f87b2';

  ngAfterViewInit(): void {
    window.onload = () => (this.windowWidthResize = window.innerWidth >= 900);
    window.onresize = () => (this.windowWidthResize = window.innerWidth >= 900);
    Promise.resolve().then(() => this.resizeDivs());
    this.componentDisplayService.mapBtnSubject.subscribe((mapBtnDisplay) => {
      if (mapBtnDisplay) {
        this.clickMap();
      }
    });
    this.componentDisplayService.graphBtnSubject.subscribe(
      (graphBtnDisplay) => {
        if (graphBtnDisplay) {
          this.clickGraph();
        }
      }
    );
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
    this.selectBtn('home');
  }

  public clickMap() {
    this.showMap = true;
    this.showInfo = false;
    this.showGraph = false;
    this.showIntro = false;
    this.selectBtn('map');
  }

  public clickInfo() {
    this.showInfo = true;
    this.showMap = false;
    this.showGraph = false;
    this.showIntro = false;
    this.selectBtn('info');
  }

  public clickGraph() {
    this.showGraph = true;
    this.showInfo = false;
    this.showMap = false;
    this.showIntro = false;
    this.selectBtn('graph');

    let flags = localStorage.getItem('cyanFlags');
    if (flags != null) {
      console.log(flags);
      this.dialog.open(ConfirmFlagsComponent);
    } else {
      return;
    }
  }

  public selectBtn(button) {
    let homeBtnFullID = document.getElementById('homeBtnFullID');
    let homeBtnSmID = document.getElementById('homeBtnSmID');
    let infoBtnID = document.getElementById('infoBtnID');
    let mapBtnID = document.getElementById('mapBtnID');
    let graphBtnID = document.getElementById('graphBtnID');
    if (button == 'home') {
      homeBtnFullID.style.color = this.homeColor;
      homeBtnFullID.style.backgroundColor = this.selectedColor;
      homeBtnSmID.style.color = this.homeColor;
      homeBtnSmID.style.backgroundColor = this.selectedColor;
    }
    if (button !== 'home') {
      homeBtnFullID.style.color = 'rgb(255, 255, 255)';
      homeBtnFullID.style.backgroundColor = '#f2e6b1';
      homeBtnSmID.style.color = 'rgb(255, 255, 255)';
      homeBtnSmID.style.backgroundColor = '#f2e6b1';
    }
    if (button == 'graph') {
      graphBtnID.style.color = this.graphColor;
      graphBtnID.style.backgroundColor = this.selectedColor;
    }
    if (button !== 'graph') {
      graphBtnID.style.color = this.selectedColor;
      graphBtnID.style.backgroundColor = this.graphColor;
    }
    if (button == 'info') {
      infoBtnID.style.color = this.infoColor;
      infoBtnID.style.backgroundColor = this.selectedColor;
    }
    if (button !== 'info') {
      infoBtnID.style.color = this.selectedColor;
      infoBtnID.style.backgroundColor = this.infoColor;
    }
    if (button == 'map') {
      mapBtnID.style.color = this.mapColor;
      mapBtnID.style.backgroundColor = this.selectedColor;
    }
    if (button !== 'map') {
      mapBtnID.style.color = this.selectedColor;
      mapBtnID.style.backgroundColor = this.mapColor;
    }
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
