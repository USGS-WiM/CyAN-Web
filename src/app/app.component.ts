import { Component } from '@angular/core';
import { ComponentDisplayService } from 'src/app/shared/services/component-display.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private componentDisplayService: ComponentDisplayService) {}
  usaBarCollapse = true;

  public clickUsaBarCollapse() {
    this.usaBarCollapse = !this.usaBarCollapse;
    this.componentDisplayService.getUsaBarCollapse(this.usaBarCollapse);
  }

  title = 'CyAN-Web';
}
