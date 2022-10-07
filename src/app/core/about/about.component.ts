import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor() {}

  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    this.resizeDivs();
  }

  public resizeDivs() {
    //get window dimensions
    let windowHeight = window.innerHeight;
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
    if (windowHeight < 590) {
      infoPanelID.classList.add('marginTopSmallHeight');
      infoPanelID.classList.remove('marginTopFullHeight');
    }
    if (windowHeight > 590) {
      infoPanelID.classList.remove('marginTopSmallHeight');
      infoPanelID.classList.add('marginTopFullHeight');
    }
  }
}
