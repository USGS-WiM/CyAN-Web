import { Component, OnInit, HostListener } from '@angular/core';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class IntroComponent implements OnInit {
  constructor(private componentDisplayService: ComponentDisplayService) {}
  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    this.resizeDivs();
    this.componentDisplayService.usaBarCollapseSubject.subscribe(
      (usaBarBoolean) => {
        this.componentDisplayService.usaBarCollapseSubject.subscribe(
          (usaBarBoolean) => {
            setTimeout(() => {
              this.resizeDivs();
            }, 0.1);
          }
        );
      }
    );
  }

  public clickIntroMap() {
    this.componentDisplayService.getMapBtn(true);
    this.componentDisplayService.getMapBtn(false);
    this.componentDisplayService.getDisableMap(false);
  }
  public clickIntroGraph() {
    this.componentDisplayService.getGraphBtn(true);
    this.componentDisplayService.getGraphBtn(false);
    this.componentDisplayService.getDisableMap(true);
  }
  public clickAccessibility() {
    this.componentDisplayService.getAboutBtn(true);
    this.componentDisplayService.getAboutBtn(false);
    this.componentDisplayService.getAccessibilityBtn(true);
    this.componentDisplayService.getAccessibilityBtn(false);
    this.componentDisplayService.getDisableMap(true);
  }

  public resizeDivs() {
    //get map height
    let mapContainer = document.getElementById('mapContainer');
    let mapHeight = parseInt(window.getComputedStyle(mapContainer).height);

    //get window width
    let windowWidth = window.innerWidth;
    let introID = document.getElementById('introID');
    if (windowWidth < 900) {
      introID.classList.remove('marginLeftFullWidth');
      introID.classList.add('marginLeftSmallWidth');
    }
    if (windowWidth > 900) {
      introID.classList.add('marginLeftFullWidth');
      introID.classList.remove('marginLeftSmallWidth');
    }
    if (mapHeight < 570) {
      introID.classList.add('marginTopSmallHeight');
      introID.classList.remove('marginTopFullHeight');
      introID.style.height = (mapHeight - 105).toString() + 'px';
    }
    if (mapHeight > 570) {
      introID.classList.remove('marginTopSmallHeight');
      introID.classList.add('marginTopFullHeight');
      introID.style.height = (mapHeight - 125).toString() + 'px';
    }
  }
}
