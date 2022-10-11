import { Component, OnInit, HostListener } from '@angular/core';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor(private componentDisplayService: ComponentDisplayService) {}

  public faq: Boolean = true;
  public disclaimer: Boolean = false;
  public userGuide: Boolean = false;
  public selectedBackground = null;
  public buttonText = 'rgb(255, 255, 255)';
  public buttonBackground = '#95dab6';

  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    this.selectBtn('faqView');
    this.resizeDivs();
    this.componentDisplayService.usaBarCollapseSubject.subscribe(
      (usaBarBoolean) => {
        setTimeout(() => {
          this.resizeDivs();
        }, 0.1);
      }
    );
  }

  public aboutView(view: String) {
    if (view === 'faqView') {
      this.faq = true;
      this.disclaimer = false;
      this.userGuide = false;
    }
    if (view === 'disclaimerView') {
      this.faq = false;
      this.disclaimer = true;
      this.userGuide = false;
    }
    if (view === 'userGuideView') {
      this.faq = false;
      this.disclaimer = false;
      this.userGuide = true;
    }
    this.selectBtn(view);
  }

  public selectBtn(button) {
    let faqViewID = document.getElementById('faqViewID');
    let userGuideViewID = document.getElementById('userGuideViewID');
    let disclaimerViewID = document.getElementById('disclaimerViewID');
    if (button == 'faqView') {
      faqViewID.style.color = this.buttonBackground;
      faqViewID.style.backgroundColor = this.selectedBackground;

      userGuideViewID.style.color = this.buttonText;
      userGuideViewID.style.backgroundColor = this.buttonBackground;

      disclaimerViewID.style.color = this.buttonText;
      disclaimerViewID.style.backgroundColor = this.buttonBackground;
    }
    if (button == 'disclaimerView') {
      disclaimerViewID.style.color = this.buttonBackground;
      disclaimerViewID.style.backgroundColor = this.selectedBackground;

      userGuideViewID.style.color = this.buttonText;
      userGuideViewID.style.backgroundColor = this.buttonBackground;

      //faqViewID.style.color = this.buttonText;
      faqViewID.style.backgroundColor = this.buttonBackground;
    }
    if (button == 'userGuideView') {
      userGuideViewID.style.color = this.buttonBackground;
      userGuideViewID.style.backgroundColor = this.selectedBackground;

      disclaimerViewID.style.color = this.buttonText;
      disclaimerViewID.style.backgroundColor = this.buttonBackground;

      faqViewID.style.color = this.buttonText;
      faqViewID.style.backgroundColor = this.buttonBackground;
    }
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
    if (mapHeight < 570) {
      infoPanelID.classList.add('marginTopSmallHeight');
      infoPanelID.classList.remove('marginTopFullHeight');
      infoPanelID.style.height = (mapHeight - 110).toString() + 'px';
    }
    if (mapHeight > 570) {
      infoPanelID.classList.remove('marginTopSmallHeight');
      infoPanelID.classList.add('marginTopFullHeight');
      infoPanelID.style.height = (mapHeight - 110).toString() + 'px';
    }
  }
}
