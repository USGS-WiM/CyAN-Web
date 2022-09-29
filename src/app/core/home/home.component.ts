import {
    Component, AfterViewInit, HostListener
}
from '@angular/core';

@Component({ selector: 'app-home', templateUrl: './home.component.html', styleUrls: ['./home.component.scss'], }) export class HomeComponent implements AfterViewInit {
    constructor() {}
    // @HostListener('window:resize')
    // onResize() {
    //     this.resizeDivs();
    // }


	public viewTab = "about";

    public showHomeLayout: Boolean = true;
    public showMap: Boolean = false;
    public showInfo: Boolean = false;
    public showGraph: Boolean = false;
    public windowWidthResize = false;
    public fullHomeScreen = true;
    public showFullCyanHomeBtn: Boolean = true;

    ngAfterViewInit():void {
        window.onload =() =>(this.windowWidthResize = window.innerWidth >= 800);
        window.onresize =() =>(this.windowWidthResize = window.innerWidth >= 800);
        Promise.resolve().then(() => this.resizeDivs());
    }

    public changeLayout(homeLayout: Boolean) {
        this.showHomeLayout = homeLayout;
        if(homeLayout === true) {
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
        // get window dimensions
        let windowWidth = window.innerWidth;

        let homeBtnFullID = document.getElementById('homeBtnFullID');
        let mapBtnFullID = document.getElementById('mapBtnFullID');
        let mapGraphID = document.getElementById('mapGraphID');
        if(windowWidth < 800 && !this.showHomeLayout) {
            this.showFullCyanHomeBtn = false;
        }
        if(windowWidth > 800 || this.showHomeLayout) {
            this.showFullCyanHomeBtn = true;
        }
        if(windowWidth < 1000) {
            this.fullHomeScreen = false;
            mapGraphID.classList.remove('mapGraphBtnGap');
        }
        if(windowWidth > 1000) {
            this.fullHomeScreen = true;

            mapGraphID.classList.add('mapGraphBtnGap');

            mapBtnFullID.classList.add('mapBtnFullMargin');
            mapBtnFullID.classList.remove('mapBtnSmallMargin');
        }
        if(this.showHomeLayout) {
            homeBtnFullID.classList.remove('marginLeftFullWidth');
        }
        if(!this.showHomeLayout) {
            homeBtnFullID.classList.add('marginLeftFullWidth');
        }
    }
}
