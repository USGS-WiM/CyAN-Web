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
        if (usaBarBoolean) {
          this.resizeDivs();
        }
        if (!usaBarBoolean) {
          this.resizeDivs();
        }
      }
    );
  }

  public resizeDivs() {
    let mapContainer = document.getElementById('mapContainer');
    var mapHeight = parseInt(window.getComputedStyle(mapContainer).height);

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
    if (mapHeight < 440) {
      introID.classList.add('marginTopSmallHeight');
      introID.classList.remove('marginTopFullHeight');
      introID.style.height = (mapHeight - 95).toString() + 'px';
    }
    if (mapHeight > 440) {
      introID.classList.remove('marginTopSmallHeight');
      introID.classList.add('marginTopFullHeight');
      introID.style.height = (mapHeight - 115).toString() + 'px';
    }
  }
}
