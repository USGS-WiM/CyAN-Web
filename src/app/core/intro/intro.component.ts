import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class IntroComponent implements OnInit {
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
    let introID = document.getElementById('introID');
    if (windowWidth < 900) {
      introID.classList.remove('marginLeftFullWidth');
      introID.classList.add('marginLeftSmallWidth');
    }
    if (windowWidth > 900) {
      introID.classList.add('marginLeftFullWidth');
      introID.classList.remove('marginLeftSmallWidth');
    }
    if (windowHeight < 590) {
      introID.classList.add('marginTopSmallHeight');
      introID.classList.remove('marginTopFullHeight');
    }
    if (windowHeight > 590) {
      introID.classList.remove('marginTopSmallHeight');
      introID.classList.add('marginTopFullHeight');
    }
  }
}
