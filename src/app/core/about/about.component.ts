import { Component, OnInit, HostListener } from '@angular/core';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';
import { Observable } from 'rxjs/Observable';
import { FiltersService } from '../../shared/services/filters.service';
import { TOOLTIPS } from '../../app.tooltips';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./../core.component.scss'],
})
export class AboutComponent implements OnInit {
  constructor(
    private componentDisplayService: ComponentDisplayService,
    private filterService: FiltersService
  ) {
    this.parameterTypes$ = this.filterService.parameterTypes$;
    this.methodTypes$ = this.filterService.methodTypes$;
  }

  public faq: Boolean = true;
  public disclaimer: Boolean = false;
  public userGuide: Boolean = false;
  public accessibility: Boolean = false;
  public selectedBackground = null;
  public buttonText = 'rgb(255, 255, 255)';
  public buttonBackground = '#f2ccb1';
  public buttonBorderSelected = '2px solid white';
  public buttonBorder = '2px solid rgb(163, 152, 152)';

  //Data retrieved from service
  public parameterTypes$: Observable<any[]>;
  public methodTypes$: Observable<any[]>;
  public mcodeShortName;
  public parameterTypes;
  public allFlagTypes;
  public sampleFlags;

  @HostListener('window:resize')
  onResize() {
    this.resizeDivs();
  }

  ngOnInit(): void {
    this.getMetadata();
    this.selectBtn('faqView');
    this.resizeDivs();
    this.componentDisplayService.usaBarCollapseSubject.subscribe(
      (usaBarBoolean) => {
        setTimeout(() => {
          this.resizeDivs();
        }, 0.1);
      }
    );
    this.componentDisplayService.accessibilityBtnSubject.subscribe(
      (accessibilityBtnDisplay) => {
        if (accessibilityBtnDisplay) {
          this.aboutView('accessibilityView');
        }
      }
    );
    this.componentDisplayService.highContrastSubject.subscribe(
      (highContrast) => {
        if (highContrast === true) {
          //turn on high contrast
          this.buttonBackground = '#643411';
          this.aboutView('accessibilityView');
          // Get a NodeList of all .demo elements
          const demoClasses = document.querySelectorAll('.dataBtn');

          // Change the text of multiple elements with a loop
          demoClasses.forEach((element) => {
            element.classList.add('highContrastGreen');
          });
        }
        if (highContrast === false) {
          //turn off high contrast
          this.buttonBackground = '#f2ccb1';
          this.aboutView('accessibilityView');
          // Get a NodeList of all .demo elements
          const demoClasses = document.querySelectorAll('.dataBtn');

          // Change the text of multiple elements with a loop
          demoClasses.forEach((element) => {
            element.classList.remove('highContrastGreen');
          });
        }
      }
    );
  }

  public getMetadata() {
    this.methodTypes$.subscribe((codes) => (this.mcodeShortName = codes));
    this.parameterTypes$.subscribe(
      (parameters) => (this.parameterTypes = parameters)
    );
    this.allFlagTypes = this.filterService.flagTypes;
    this.sampleFlags = this.filterService.sampleFlags;
  }

  pcodeDownload() {
    this.createCSV(this.parameterTypes, 'pcodes.csv');
  }

  mcodeDownload() {
    this.createCSV(this.mcodeShortName, 'mcodes.csv');
  }

  flagTypesDownload() {
    this.createCSV(this.allFlagTypes, 'flagTypes.csv');
  }

  flagTemplateDownload() {
    this.createCSV(this.sampleFlags, 'flagTemplate.csv');
  }

  createCSV(data, filename) {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let csv = data.map((row) => Object.values(row));
    csv.unshift(Object.keys(data[0]));
    csvContent += csv.join('\n');
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
  }

  changeContrast(contrastChecked: MatCheckboxChange) {
    if (contrastChecked.checked) {
      //turn on high contrast
      this.componentDisplayService.getHighContrastSubject(true);
    } else {
      //turn off high contrast
      this.componentDisplayService.getHighContrastSubject(false);
    }
  }

  public aboutView(view: String) {
    if (view === 'faqView') {
      this.faq = true;
      this.disclaimer = false;
      this.userGuide = false;
      this.accessibility = false;
    }
    if (view === 'disclaimerView') {
      this.faq = false;
      this.disclaimer = true;
      this.userGuide = false;
      this.accessibility = false;
    }
    if (view === 'userGuideView') {
      this.faq = false;
      this.disclaimer = false;
      this.userGuide = true;
      this.accessibility = false;
    }
    if (view === 'accessibilityView') {
      this.faq = false;
      this.disclaimer = false;
      this.userGuide = false;
      this.accessibility = true;
    }
    this.selectBtn(view);
  }

  public selectBtn(button) {
    let faqViewID = document.getElementById('faqViewID');
    let userGuideViewID = document.getElementById('userGuideViewID');
    let disclaimerViewID = document.getElementById('disclaimerViewID');
    let accessibilityViewID = document.getElementById('accessibilityViewID');
    if (button == 'faqView') {
      faqViewID.style.color = this.buttonBackground;
      faqViewID.style.backgroundColor = this.selectedBackground;
      faqViewID.style.border = this.buttonBorderSelected;

      userGuideViewID.style.color = this.buttonText;
      userGuideViewID.style.backgroundColor = this.buttonBackground;
      userGuideViewID.style.border = this.buttonBorder;

      disclaimerViewID.style.color = this.buttonText;
      disclaimerViewID.style.backgroundColor = this.buttonBackground;
      disclaimerViewID.style.border = this.buttonBorder;

      accessibilityViewID.style.color = this.buttonText;
      accessibilityViewID.style.backgroundColor = this.buttonBackground;
      accessibilityViewID.style.border = this.buttonBorder;
    }
    if (button == 'disclaimerView') {
      disclaimerViewID.style.color = this.buttonBackground;
      disclaimerViewID.style.backgroundColor = this.selectedBackground;
      disclaimerViewID.style.border = this.buttonBorderSelected;

      userGuideViewID.style.color = this.buttonText;
      userGuideViewID.style.backgroundColor = this.buttonBackground;
      userGuideViewID.style.border = this.buttonBorder;

      faqViewID.style.color = this.buttonText;
      faqViewID.style.backgroundColor = this.buttonBackground;
      faqViewID.style.border = this.buttonBorder;

      accessibilityViewID.style.color = this.buttonText;
      accessibilityViewID.style.backgroundColor = this.buttonBackground;
      accessibilityViewID.style.border = this.buttonBorder;
    }
    if (button == 'userGuideView') {
      userGuideViewID.style.color = this.buttonBackground;
      userGuideViewID.style.backgroundColor = this.selectedBackground;
      userGuideViewID.style.border = this.buttonBorderSelected;

      disclaimerViewID.style.color = this.buttonText;
      disclaimerViewID.style.backgroundColor = this.buttonBackground;
      disclaimerViewID.style.border = this.buttonBorder;

      faqViewID.style.color = this.buttonText;
      faqViewID.style.backgroundColor = this.buttonBackground;
      faqViewID.style.border = this.buttonBorder;

      accessibilityViewID.style.color = this.buttonText;
      accessibilityViewID.style.backgroundColor = this.buttonBackground;
      accessibilityViewID.style.border = this.buttonBorder;
    }
    if (button == 'accessibilityView') {
      accessibilityViewID.style.color = this.buttonBackground;
      accessibilityViewID.style.backgroundColor = this.selectedBackground;
      accessibilityViewID.style.border = this.buttonBorderSelected;

      disclaimerViewID.style.color = this.buttonText;
      disclaimerViewID.style.backgroundColor = this.buttonBackground;
      disclaimerViewID.style.border = this.buttonBorder;

      faqViewID.style.color = this.buttonText;
      faqViewID.style.backgroundColor = this.buttonBackground;
      faqViewID.style.border = this.buttonBorder;

      userGuideViewID.style.color = this.buttonText;
      userGuideViewID.style.backgroundColor = this.buttonBackground;
      userGuideViewID.style.border = this.buttonBorder;
    }
  }

  public resizeDivs() {
    //get map height
    let mapContainer = document.getElementById('mapContainer');
    let mapHeight = parseInt(window.getComputedStyle(mapContainer).height);

    //get window width
    let windowWidth = window.innerWidth;
    let infoPanelID = document.getElementById('infoPanelID');
    let infoContentID = document.getElementById('infoContentID');

    infoPanelID.style.height = (mapHeight - 130).toString() + 'px';
    infoContentID.style.height = (mapHeight - 210).toString() + 'px';
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
    }
    if (mapHeight > 570) {
      infoPanelID.classList.remove('marginTopSmallHeight');
      infoPanelID.classList.add('marginTopFullHeight');
    }
  }

  flagTypesTooltip() {
    const string = TOOLTIPS.flagTypesTooltip;
    return string;
  }
  flagTemplateTooltip() {
    const string = TOOLTIPS.flagTemplateTooltip;
    return string;
  }
}
