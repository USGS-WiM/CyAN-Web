import { Component, OnInit, HostListener } from '@angular/core';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor(private componentDisplayService: ComponentDisplayService) {}

  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    this.resizeDivs();
    this.componentDisplayService.usaBarCollapseSubject.subscribe(
      (usaBarBoolean) => {
        setTimeout(() => {
          this.resizeDivs();
        }, 0.1);
      }
    );
  }

  public resizeDivs() {
    //get map height
    let mapContainer = document.getElementById('mapContainer');
    let mapHeight = parseInt(window.getComputedStyle(mapContainer).height);

    //get window width
    let windowWidth = window.innerWidth;
    let infoPanelID = document.getElementById('infoPanelID');
    if (windowWidth < 900) {
      infoPanelID.classList.remove('marginLeftFullWidth');
      infoPanelID.classList.add('marginLeftSmallWidth');
    }
    if (windowWidth > 900) {
      infoPanelID.classList.add('marginLeftFullWidth');
      infoPanelID.classList.remove('marginLeftSmallWidth');
    }
    if (mapHeight < 590) {
      infoPanelID.classList.add('marginTopSmallHeight');
      infoPanelID.classList.remove('marginTopFullHeight');
      infoPanelID.style.height = (mapHeight - 95).toString() + 'px';
    }
    if (mapHeight > 590) {
      infoPanelID.classList.remove('marginTopSmallHeight');
      infoPanelID.classList.add('marginTopFullHeight');
      infoPanelID.style.height = (mapHeight - 95).toString() + 'px';
    }
  }
}
